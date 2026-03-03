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

parse_entity() {
  local file=$1
  local table=$(grep -oP '(?<=export class )\w+' "$file" | head -1 | sed 's/\([A-Z]\)/_\1/g' | sed 's/^_//' | tr '[:upper:]' '[:lower:]')s

  echo "CREATE TABLE IF NOT EXISTS \`$table\` ("

  local cols=()

  while IFS= read -r line; do
    # PrimaryGeneratedColumn
    if echo "$line" | grep -q '@PrimaryGeneratedColumn'; then
      read -r next
      local col=$(echo "$next" | grep -oP '^\s*\K\w+(?=!)')
      cols+=("  \`$col\` INT AUTO_INCREMENT PRIMARY KEY")
      continue
    fi

    # JoinColumn (FK)
    if echo "$line" | grep -q '@JoinColumn'; then
      read -r next
      local col=$(echo "$next" | grep -oP '(?<=  )\w+(?=!)')
      [ -n "$col" ] && cols+=("  \`${col}_id\` INT")
      continue
    fi

    # Column
    if echo "$line" | grep -q '@Column'; then
      local nullable=$(echo "$line" | grep -q 'nullable: true' && echo "NULL" || echo "NOT NULL")
      local type="VARCHAR(255)"

      echo "$line" | grep -qiP "type.*int"      && type="INT"
      echo "$line" | grep -qiP "type.*bool"     && type="TINYINT(1)"
      echo "$line" | grep -qiP "type.*text"     && type="TEXT"
      echo "$line" | grep -qiP "type.*float"    && type="FLOAT"
      echo "$line" | grep -qiP "type.*double"   && type="DOUBLE"
      echo "$line" | grep -qiP "type.*date"     && type="DATETIME"
      echo "$line" | grep -qiP "type.*timestamp" && type="TIMESTAMP"

      read -r next
      local col=$(echo "$next" | grep -oP '\w+(?=!)')

      # infer type from TS type if not set in @Column
      echo "$next" | grep -qiP ':\s*boolean' && type="TINYINT(1)"
      echo "$next" | grep -qiP ':\s*number'  && type="INT"
      echo "$next" | grep -qiP ':\s*Date'    && type="DATETIME"

      [ -n "$col" ] && cols+=("  \`$col\` $type $nullable")
    fi
  done < "$file"

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

echo "$SQL"
echo "🚀 Applying to database..."
echo "$SQL" | $MYSQL $DB

echo "🎉 Done!"