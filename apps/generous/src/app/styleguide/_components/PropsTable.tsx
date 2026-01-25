"use client";

import styles from "./PropsTable.module.css";

export interface PropDefinition {
  /**
   * Property name
   */
  name: string;
  /**
   * TypeScript type
   */
  type: string;
  /**
   * Default value
   */
  defaultValue?: string;
  /**
   * Whether the prop is required
   */
  required?: boolean;
  /**
   * Description of the prop
   */
  description: string;
}

export interface PropsTableProps {
  /**
   * Component name for the heading
   */
  componentName?: string;
  /**
   * Array of prop definitions
   */
  props: PropDefinition[];
}

export function PropsTable({ componentName, props }: PropsTableProps) {
  if (props.length === 0) {
    return null;
  }

  return (
    <div className={styles.container}>
      {componentName && (
        <h3 className={styles.heading}>
          <code className={styles.componentName}>{componentName}</code> Props
        </h3>
      )}
      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th className={styles.th}>Prop</th>
              <th className={styles.th}>Type</th>
              <th className={styles.th}>Default</th>
              <th className={styles.th}>Description</th>
            </tr>
          </thead>
          <tbody>
            {props.map((prop) => (
              <tr key={prop.name} className={styles.tr}>
                <td className={styles.td}>
                  <code className={styles.propName}>{prop.name}</code>
                  {prop.required && <span className={styles.required}>*</span>}
                </td>
                <td className={styles.td}>
                  <code className={styles.type}>{prop.type}</code>
                </td>
                <td className={styles.td}>
                  {prop.defaultValue ? (
                    <code className={styles.default}>{prop.defaultValue}</code>
                  ) : (
                    <span className={styles.dash}>—</span>
                  )}
                </td>
                <td className={styles.td}>
                  <span className={styles.description}>{prop.description}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ============================================
 * QUICK PROPS (Compact format)
 * ============================================ */

export interface QuickPropsProps {
  props: {
    name: string;
    type: string;
    default?: string;
  }[];
}

export function QuickProps({ props }: QuickPropsProps) {
  return (
    <div className={styles.quickProps}>
      {props.map((prop) => (
        <div key={prop.name} className={styles.quickProp}>
          <code className={styles.quickName}>{prop.name}</code>
          <code className={styles.quickType}>{prop.type}</code>
          {prop.default && <span className={styles.quickDefault}>= {prop.default}</span>}
        </div>
      ))}
    </div>
  );
}
