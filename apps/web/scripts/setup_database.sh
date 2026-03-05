#!/bin/bash

export $(grep -v '^#' .env.local | xargs)

HOST=${DB_HOST:-localhost}
PORT=${DB_PORT:-3306}
USER=${DB_USER:-root}
PASS=${DB_PASSWORD:-root}
DB=${DB_NAME:-myapp}

MYSQL="mysql -h $HOST -P $PORT -u $USER -p$PASS"

echo "🔌 Connecting to MySQL..."
$MYSQL -e "CREATE DATABASE IF NOT EXISTS \`$DB\`;" 2>/dev/null || { echo "❌ Connection failed."; exit 1; }
echo "✅ Database '$DB' ready!"

to_table_name() {
  echo "$1" | sed 's/\([A-Z]\)/_\1/g' | sed 's/^_//' | tr '[:upper:]' '[:lower:]' | sed 's/s$//'  
}

# Global arrays for FK and junction table SQL
declare -a FK_STATEMENTS=()
declare -a JUNCTION_TABLES=()

parse_entity() {
  local file=$1
  local class_name=$(grep -oP '(?<=export class )\w+' "$file" | head -1)
  local table="${class_name,,}s"
  # Convert CamelCase to snake_case
  table=$(echo "$class_name" | sed 's/\([A-Z]\)/_\1/g' | sed 's/^_//' | tr '[:upper:]' '[:lower:]')s

  local cols=()
  local lines=()

  # Read all lines into array for lookahead
  while IFS= read -r line; do
    lines+=("$line")
  done < "$file"

  local total=${#lines[@]}

  for ((i=0; i<total; i++)); do
    local line="${lines[$i]}"
    local next="${lines[$((i+1))]}"
    local next2="${lines[$((i+2))]}"

    # PrimaryGeneratedColumn
    if echo "$line" | grep -q '@PrimaryGeneratedColumn'; then
      local col=$(echo "$next" | grep -oP '^\s*\K\w+(?=[!?:])')
      [ -n "$col" ] && cols+=("  \`$col\` INT AUTO_INCREMENT PRIMARY KEY")
      ((i++))
      continue
    fi

    # ManyToOne — adds FK column on this table
    if echo "$line" | grep -q '@ManyToOne'; then
      local rel_type=$(echo "$line" | grep -oP '(?<=ManyToOne\().*?(?=,|\))' | grep -oP '\w+' | tail -1)
      local rel_table=$(echo "$rel_type" | sed 's/\([A-Z]\)/_\1/g' | sed 's/^_//' | tr '[:upper:]' '[:lower:]')s

      # Check if next decorator is @JoinColumn
      local fk_col=""
      if echo "$next" | grep -q '@JoinColumn'; then
        # Custom FK column name from @JoinColumn({ name: '...' })
        fk_col=$(echo "$next" | grep -oP "(?<=name:\s')[^']+|(?<=name:\s\")[^\"]+")
        if [ -z "$fk_col" ]; then
          local prop=$(echo "${lines[$((i+2))]}" | grep -oP '^\s*\K\w+(?=[!?:])')
          fk_col="${prop}Id"
        fi
        ((i++)) # skip @JoinColumn line
      else
        local prop=$(echo "$next" | grep -oP '^\s*\K\w+(?=[!?:])')
        fk_col="${prop}Id"
      fi

      local nullable=$(echo "$line" | grep -q 'nullable: true' && echo "NULL" || echo "NOT NULL")
      [ -n "$fk_col" ] && cols+=("  \`$fk_col\` INT $nullable")

      # Store FK constraint for later
      FK_STATEMENTS+=("ALTER TABLE \`$table\` ADD CONSTRAINT \`fk_${table}_${fk_col}\` FOREIGN KEY (\`$fk_col\`) REFERENCES \`$rel_table\`(\`id\`);")
      ((i++))
      continue
    fi

    # OneToOne — adds FK column on this table if @JoinColumn is present
    if echo "$line" | grep -q '@OneToOne'; then
      local rel_type=$(echo "$line" | grep -oP '(?<=OneToOne\().*?(?=,|\))' | grep -oP '\w+' | tail -1)
      local rel_table=$(echo "$rel_type" | sed 's/\([A-Z]\)/_\1/g' | sed 's/^_//' | tr '[:upper:]' '[:lower:]')s

      if echo "$next" | grep -q '@JoinColumn'; then
        local fk_col=$(echo "$next" | grep -oP "(?<=name:\s')[^']+|(?<=name:\s\")[^\"]+")
        if [ -z "$fk_col" ]; then
          local prop=$(echo "${lines[$((i+2))]}" | grep -oP '^\s*\K\w+(?=[!?:])')
          fk_col="${prop}Id"
        fi
        local nullable=$(echo "$line" | grep -q 'nullable: true' && echo "NULL" || echo "NOT NULL")
        cols+=("  \`$fk_col\` INT UNIQUE $nullable")
        FK_STATEMENTS+=("ALTER TABLE \`$table\` ADD CONSTRAINT \`fk_${table}_${fk_col}\` FOREIGN KEY (\`$fk_col\`) REFERENCES \`$rel_table\`(\`id\`);")
        ((i++))
      fi
      ((i++))
      continue
    fi

    # ManyToMany — creates junction table
    if echo "$line" | grep -q '@ManyToMany'; then
      # Only create junction table for the owning side (@JoinTable)
      if echo "$next" | grep -q '@JoinTable\|@JoinColumn'; then
        local rel_type=$(echo "$line" | grep -oP '(?<=ManyToMany\().*?(?=,|\))' | grep -oP '\w+' | tail -1)
        local rel_table=$(echo "$rel_type" | sed 's/\([A-Z]\)/_\1/g' | sed 's/^_//' | tr '[:upper:]' '[:lower:]')s

        # Sort table names for consistent junction table naming
        local jt_name
        if [[ "$table" < "$rel_table" ]]; then
          jt_name="${table}_${rel_table}"
        else
          jt_name="${rel_table}_${table}"
        fi

        local owner_fk="${table%s}Id"
        local inverse_fk="${rel_table%s}Id"

        # Avoid duplicate junction tables
        local already=false
        for jt in "${JUNCTION_TABLES[@]}"; do
          [[ "$jt" == *"$jt_name"* ]] && already=true && break
        done

        if ! $already; then
          JUNCTION_TABLES+=("CREATE TABLE IF NOT EXISTS \`$jt_name\` (
  \`${owner_fk}\` INT NOT NULL,
  \`${inverse_fk}\` INT NOT NULL,
  PRIMARY KEY (\`${owner_fk}\`, \`${inverse_fk}\`),
  CONSTRAINT \`fk_${jt_name}_${owner_fk}\` FOREIGN KEY (\`${owner_fk}\`) REFERENCES \`$table\`(\`id\`),
  CONSTRAINT \`fk_${jt_name}_${inverse_fk}\` FOREIGN KEY (\`${inverse_fk}\`) REFERENCES \`$rel_table\`(\`id\`)
);")
        fi
        ((i++))
      fi
      ((i++))
      continue
    fi

    # OneToMany — no column needed (FK is on the other table), skip
    if echo "$line" | grep -q '@OneToMany'; then
      ((i++))
      continue
    fi

    # Regular @Column
    if echo "$line" | grep -q '@Column'; then
      local nullable=$(echo "$line" | grep -q 'nullable: true' && echo "NULL" || echo "NOT NULL")
      local type="VARCHAR(255)"

      echo "$line" | grep -qiP "type.*\bint\b"       && type="INT"
      echo "$line" | grep -qiP "type.*bool"           && type="TINYINT(1)"
      echo "$line" | grep -qiP "type.*text"           && type="TEXT"
      echo "$line" | grep -qiP "type.*float"          && type="FLOAT"
      echo "$line" | grep -qiP "type.*double"         && type="DOUBLE"
      echo "$line" | grep -qiP "type.*decimal"        && type="DECIMAL(10,2)"
      echo "$line" | grep -qiP "type.*date\b"         && type="DATE"
      echo "$line" | grep -qiP "type.*timestamp"      && type="TIMESTAMP"
      echo "$line" | grep -qiP "type.*datetime"       && type="DATETIME"
      echo "$line" | grep -qiP "type.*json"           && type="JSON"
      echo "$line" | grep -qiP "type.*enum"           && type="ENUM('pending','active','inactive')" # fallback

      local col=$(echo "$next" | grep -oP '^\s*\K\w+(?=[!?:])')

      # Infer from TS type if @Column didn't specify
      echo "$next" | grep -qiP ':\s*boolean' && type="TINYINT(1)"
      echo "$next" | grep -qiP ':\s*number'  && type="INT"
      echo "$next" | grep -qiP ':\s*Date'    && type="DATETIME"

      [ -n "$col" ] && cols+=("  \`$col\` $type $nullable")
      ((i++))
    fi
  done

  # Build CREATE TABLE statement
  echo "CREATE TABLE IF NOT EXISTS \`$table\` ("
  local first=true
  for col in "${cols[@]}"; do
    if $first; then
      echo "$col"
      first=false
    else
      echo ",$col"
    fi
  done
  echo ");"
  echo ""
}

echo "📄 Generating SQL from entities..."
SQL=""
for f in ./entities/*.ts; do
  SQL+=$(parse_entity "$f")
  SQL+=$'\n'
done

# Append junction tables
for jt in "${JUNCTION_TABLES[@]}"; do
  SQL+="$jt"$'\n\n'
done

# Append FK constraints
for fk in "${FK_STATEMENTS[@]}"; do
  SQL+="$fk"$'\n'
done

echo "$SQL"
echo "🚀 Applying to database..."
echo "$SQL" | $MYSQL $DB

echo "🎉 Done!"