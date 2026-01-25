"use client";

import { Select } from "@generous/ui";
import { useState } from "react";
import {
  CodeExample,
  ComponentPage,
  PreviewBox,
  PropsTable,
  Section,
  SizeComparison,
  SizeItem,
  StateGrid,
  StateItem,
} from "../../_components";
import styles from "./page.module.css";

const selectProps = [
  {
    name: "value",
    type: "string",
    description: "Controlled selected value",
  },
  {
    name: "defaultValue",
    type: "string",
    description: "Default selected value (uncontrolled)",
  },
  {
    name: "onValueChange",
    type: "(value: string) => void",
    description: "Callback when selected value changes",
  },
  {
    name: "open",
    type: "boolean",
    description: "Controlled open state",
  },
  {
    name: "onOpenChange",
    type: "(open: boolean) => void",
    description: "Callback when open state changes",
  },
  {
    name: "disabled",
    type: "boolean",
    defaultValue: "false",
    description: "Whether the select is disabled",
  },
  {
    name: "size",
    type: '"sm" | "md" | "lg"',
    defaultValue: '"md"',
    description: "Size of the select trigger",
  },
  {
    name: "error",
    type: "boolean",
    defaultValue: "false",
    description: "Whether to show error styling",
  },
];

const basicExample = `import { Select } from "@generous/ui";

function Example() {
  return (
    <Select.Root>
      <Select.Trigger>
        <Select.Value placeholder="Select a fruit" />
        <Select.Icon />
      </Select.Trigger>
      <Select.Portal>
        <Select.Positioner>
          <Select.Content>
            <Select.Item value="apple">Apple</Select.Item>
            <Select.Item value="banana">Banana</Select.Item>
            <Select.Item value="orange">Orange</Select.Item>
          </Select.Content>
        </Select.Positioner>
      </Select.Portal>
    </Select.Root>
  );
}`;

const groupedExample = `import { Select } from "@generous/ui";

function GroupedSelect() {
  return (
    <Select.Root>
      <Select.Trigger>
        <Select.Value placeholder="Select a food" />
        <Select.Icon />
      </Select.Trigger>
      <Select.Portal>
        <Select.Positioner>
          <Select.Content>
            <Select.Group>
              <Select.Label>Fruits</Select.Label>
              <Select.Item value="apple">Apple</Select.Item>
              <Select.Item value="banana">Banana</Select.Item>
            </Select.Group>
            <Select.Separator />
            <Select.Group>
              <Select.Label>Vegetables</Select.Label>
              <Select.Item value="carrot">Carrot</Select.Item>
              <Select.Item value="broccoli">Broccoli</Select.Item>
            </Select.Group>
          </Select.Content>
        </Select.Positioner>
      </Select.Portal>
    </Select.Root>
  );
}`;

export default function SelectPage() {
  const [value, setValue] = useState("");

  return (
    <ComponentPage
      name="Select"
      description="A dropdown select component for choosing from a list of options. Built on Base UI for keyboard navigation, smart positioning, and accessibility."
      category="Selection"
      usesBaseUI
      baseUIUrl="https://base-ui.com/react/components/select"
    >
      <Section title="Interactive Demo">
        <PreviewBox>
          <div className={styles.demoGrid}>
            <div className={styles.selectWrapper}>
              <label className={styles.label}>Basic Select</label>
              <Select.Root value={value} onValueChange={setValue}>
                <Select.Trigger>
                  <Select.Value placeholder="Select a fruit" />
                  <Select.Icon />
                </Select.Trigger>
                <Select.Portal>
                  <Select.Positioner>
                    <Select.Content>
                      <Select.Item value="apple">Apple</Select.Item>
                      <Select.Item value="banana">Banana</Select.Item>
                      <Select.Item value="orange">Orange</Select.Item>
                      <Select.Item value="mango">Mango</Select.Item>
                      <Select.Item value="grape">Grape</Select.Item>
                    </Select.Content>
                  </Select.Positioner>
                </Select.Portal>
              </Select.Root>
            </div>

            <div className={styles.selectWrapper}>
              <label className={styles.label}>With Groups</label>
              <Select.Root>
                <Select.Trigger>
                  <Select.Value placeholder="Select a food" />
                  <Select.Icon />
                </Select.Trigger>
                <Select.Portal>
                  <Select.Positioner>
                    <Select.Content>
                      <Select.Group>
                        <Select.Label>Fruits</Select.Label>
                        <Select.Item value="apple">Apple</Select.Item>
                        <Select.Item value="banana">Banana</Select.Item>
                      </Select.Group>
                      <Select.Separator />
                      <Select.Group>
                        <Select.Label>Vegetables</Select.Label>
                        <Select.Item value="carrot">Carrot</Select.Item>
                        <Select.Item value="broccoli">Broccoli</Select.Item>
                      </Select.Group>
                    </Select.Content>
                  </Select.Positioner>
                </Select.Portal>
              </Select.Root>
            </div>
          </div>
        </PreviewBox>
      </Section>

      <Section title="Sizes">
        <SizeComparison>
          <SizeItem size="sm">
            <Select.Root size="sm">
              <Select.Trigger style={{ width: 200 }}>
                <Select.Value placeholder="Small" />
                <Select.Icon />
              </Select.Trigger>
              <Select.Portal>
                <Select.Positioner>
                  <Select.Content>
                    <Select.Item value="option1">Option 1</Select.Item>
                    <Select.Item value="option2">Option 2</Select.Item>
                  </Select.Content>
                </Select.Positioner>
              </Select.Portal>
            </Select.Root>
          </SizeItem>
          <SizeItem size="md">
            <Select.Root size="md">
              <Select.Trigger style={{ width: 200 }}>
                <Select.Value placeholder="Medium" />
                <Select.Icon />
              </Select.Trigger>
              <Select.Portal>
                <Select.Positioner>
                  <Select.Content>
                    <Select.Item value="option1">Option 1</Select.Item>
                    <Select.Item value="option2">Option 2</Select.Item>
                  </Select.Content>
                </Select.Positioner>
              </Select.Portal>
            </Select.Root>
          </SizeItem>
          <SizeItem size="lg">
            <Select.Root size="lg">
              <Select.Trigger style={{ width: 200 }}>
                <Select.Value placeholder="Large" />
                <Select.Icon />
              </Select.Trigger>
              <Select.Portal>
                <Select.Positioner>
                  <Select.Content>
                    <Select.Item value="option1">Option 1</Select.Item>
                    <Select.Item value="option2">Option 2</Select.Item>
                  </Select.Content>
                </Select.Positioner>
              </Select.Portal>
            </Select.Root>
          </SizeItem>
        </SizeComparison>
      </Section>

      <Section title="States">
        <StateGrid columns={3}>
          <StateItem label="Default">
            <Select.Root>
              <Select.Trigger style={{ width: 160 }}>
                <Select.Value placeholder="Select..." />
                <Select.Icon />
              </Select.Trigger>
            </Select.Root>
          </StateItem>
          <StateItem label="Disabled">
            <Select.Root disabled>
              <Select.Trigger style={{ width: 160 }}>
                <Select.Value placeholder="Disabled" />
                <Select.Icon />
              </Select.Trigger>
            </Select.Root>
          </StateItem>
          <StateItem label="Error">
            <Select.Root error>
              <Select.Trigger style={{ width: 160 }}>
                <Select.Value placeholder="Error" />
                <Select.Icon />
              </Select.Trigger>
            </Select.Root>
          </StateItem>
        </StateGrid>
      </Section>

      <Section title="Usage">
        <CodeExample code={basicExample} title="Basic Select" />
      </Section>

      <Section title="Grouped Options">
        <CodeExample code={groupedExample} title="Grouped Select" />
      </Section>

      <Section title="Props">
        <PropsTable componentName="Select.Root" props={selectProps} />
      </Section>

      <Section title="Accessibility">
        <ul className={styles.accessibilityList}>
          <li>Full keyboard navigation (Arrow keys, Enter, Escape)</li>
          <li>Type-ahead search to quickly find options</li>
          <li>
            Uses <code>role="combobox"</code> and <code>role="listbox"</code>
          </li>
          <li>Proper focus management and screen reader announcements</li>
          <li>Supports disabled items</li>
          <li>Smart positioning to stay within viewport</li>
        </ul>
      </Section>
    </ComponentPage>
  );
}
