/**
 * RefresherCallout - Cross-reference component for math refresher lessons.
 *
 * Used in CRYPTO lessons to link back to optional math prerequisite content.
 * Styled with amber color to indicate informational/optional nature.
 */

interface RefresherCalloutProps {
  /** What to refresh, e.g. "математическую нотацию" */
  topic: string;
  /** URL slug of the refresher lesson, e.g. "01-numbers-notation" */
  lessonId: string;
  /** Display name, e.g. "MATH-01: Числа и нотация" */
  lessonTitle: string;
}

export function RefresherCallout({ topic, lessonId, lessonTitle }: RefresherCalloutProps) {
  return (
    <div
      className="not-prose"
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '8px 16px',
        borderRadius: '8px',
        background: 'rgba(245, 158, 11, 0.1)',
        border: '1px solid rgba(245, 158, 11, 0.2)',
        fontSize: '14px',
        color: '#fbbf24',
        margin: '16px 0',
      }}
    >
      <span style={{ fontSize: '16px', flexShrink: 0 }}>&#x1F9ED;</span>
      <span>
        {"Нужно вспомнить " + topic + "? "}
        <a
          href={`/course/01-math-refresher/${lessonId}`}
          style={{
            color: '#fbbf24',
            textDecoration: 'underline',
          }}
          onMouseEnter={(e) => { (e.target as HTMLAnchorElement).style.color = '#fef3c7'; }}
          onMouseLeave={(e) => { (e.target as HTMLAnchorElement).style.color = '#fbbf24'; }}
        >
          {lessonTitle}
        </a>
      </span>
    </div>
  );
}
