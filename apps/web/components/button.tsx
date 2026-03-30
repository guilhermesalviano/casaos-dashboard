interface ButtonProps {
    children: React.ReactNode;
    onClick: () => void;
    ariaLabel?: string;
}

export default function Button({ children, onClick, ariaLabel }: ButtonProps) {
    return (
        <button
            onClick={onClick}
            aria-label={ariaLabel}
            style={{
                background: "var(--background)",
                border: "1px solid var(--border)",
                borderRadius: "50%",
                width: 40,
                height: 40,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "border-color 0.2s, opacity 0.2s",
                flexShrink: 0,
            }}
            onMouseEnter={(e) => (e.currentTarget.style.borderColor = "var(--border-hover)")}
            onMouseLeave={(e) => (e.currentTarget.style.borderColor = "var(--border)")}
        >
        {children}
      </button>
    )
}