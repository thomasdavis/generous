"use client";

import { Button, Popover } from "@generous/ui";
import {
  CodeExample,
  ComponentPage,
  PreviewBox,
  PropsTable,
  Section,
  VariantCard,
  VariantGrid,
} from "../../_components";
import styles from "./page.module.css";

const popoverProps = [
  {
    name: "open",
    type: "boolean",
    description: "Controlled open state",
  },
  {
    name: "defaultOpen",
    type: "boolean",
    defaultValue: "false",
    description: "Default open state (uncontrolled)",
  },
  {
    name: "onOpenChange",
    type: "(open: boolean) => void",
    description: "Callback when open state changes",
  },
  {
    name: "delay",
    type: "number",
    defaultValue: "0",
    description: "Delay before opening (ms)",
  },
  {
    name: "closeDelay",
    type: "number",
    defaultValue: "0",
    description: "Delay before closing (ms)",
  },
];

const positionerProps = [
  {
    name: "side",
    type: '"top" | "right" | "bottom" | "left"',
    defaultValue: '"bottom"',
    description: "Preferred side to position the popover",
  },
  {
    name: "align",
    type: '"start" | "center" | "end"',
    defaultValue: '"center"',
    description: "Alignment along the side",
  },
  {
    name: "sideOffset",
    type: "number",
    defaultValue: "8",
    description: "Distance from the trigger",
  },
];

const basicExample = `import { Popover, Button } from "@generous/ui";

function Example() {
  return (
    <Popover.Root>
      <Popover.Trigger asChild>
        <Button>Open Popover</Button>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Positioner>
          <Popover.Content>
            <Popover.Title>Popover Title</Popover.Title>
            <Popover.Description>
              This is the popover content. Click outside to close.
            </Popover.Description>
          </Popover.Content>
        </Popover.Positioner>
      </Popover.Portal>
    </Popover.Root>
  );
}`;

export default function PopoverPage() {
  return (
    <ComponentPage
      name="Popover"
      description="A floating panel that displays content on top of the main page content. Built on Base UI for smart positioning and focus management."
      category="Overlay"
      usesBaseUI
      baseUIUrl="https://base-ui.com/react/components/popover"
    >
      <Section title="Interactive Demo">
        <PreviewBox>
          <div className={styles.demoGrid}>
            <Popover.Root>
              <Popover.Trigger asChild>
                <Button>Click me</Button>
              </Popover.Trigger>
              <Popover.Portal>
                <Popover.Positioner side="bottom" align="start">
                  <Popover.Content>
                    <Popover.Title>Popover Title</Popover.Title>
                    <Popover.Description>
                      This is a popover with a title and description. Click outside or press Escape
                      to close.
                    </Popover.Description>
                  </Popover.Content>
                </Popover.Positioner>
              </Popover.Portal>
            </Popover.Root>
          </div>
        </PreviewBox>
      </Section>

      <Section title="Positioning">
        <VariantGrid columns={4}>
          <VariantCard title="Top" description="Positioned above the trigger">
            <Popover.Root>
              <Popover.Trigger asChild>
                <Button variant="outline" size="sm">
                  Top
                </Button>
              </Popover.Trigger>
              <Popover.Portal>
                <Popover.Positioner side="top">
                  <Popover.Content>
                    <p className={styles.popoverText}>Top popover</p>
                  </Popover.Content>
                </Popover.Positioner>
              </Popover.Portal>
            </Popover.Root>
          </VariantCard>
          <VariantCard title="Right" description="Positioned to the right">
            <Popover.Root>
              <Popover.Trigger asChild>
                <Button variant="outline" size="sm">
                  Right
                </Button>
              </Popover.Trigger>
              <Popover.Portal>
                <Popover.Positioner side="right">
                  <Popover.Content>
                    <p className={styles.popoverText}>Right popover</p>
                  </Popover.Content>
                </Popover.Positioner>
              </Popover.Portal>
            </Popover.Root>
          </VariantCard>
          <VariantCard title="Bottom" description="Positioned below the trigger">
            <Popover.Root>
              <Popover.Trigger asChild>
                <Button variant="outline" size="sm">
                  Bottom
                </Button>
              </Popover.Trigger>
              <Popover.Portal>
                <Popover.Positioner side="bottom">
                  <Popover.Content>
                    <p className={styles.popoverText}>Bottom popover</p>
                  </Popover.Content>
                </Popover.Positioner>
              </Popover.Portal>
            </Popover.Root>
          </VariantCard>
          <VariantCard title="Left" description="Positioned to the left">
            <Popover.Root>
              <Popover.Trigger asChild>
                <Button variant="outline" size="sm">
                  Left
                </Button>
              </Popover.Trigger>
              <Popover.Portal>
                <Popover.Positioner side="left">
                  <Popover.Content>
                    <p className={styles.popoverText}>Left popover</p>
                  </Popover.Content>
                </Popover.Positioner>
              </Popover.Portal>
            </Popover.Root>
          </VariantCard>
        </VariantGrid>
      </Section>

      <Section title="Usage">
        <CodeExample code={basicExample} title="Basic Popover" />
      </Section>

      <Section title="Props">
        <PropsTable componentName="Popover.Root" props={popoverProps} />
        <div style={{ marginTop: "var(--space-6)" }}>
          <PropsTable componentName="Popover.Positioner" props={positionerProps} />
        </div>
      </Section>

      <Section title="Accessibility">
        <ul className={styles.accessibilityList}>
          <li>Closes on Escape key press</li>
          <li>Closes when clicking outside</li>
          <li>Focus is managed and returned to trigger on close</li>
          <li>
            Uses <code>role="dialog"</code> by default
          </li>
          <li>Title and description linked via ARIA attributes</li>
          <li>Smart positioning keeps popover in viewport</li>
        </ul>
      </Section>
    </ComponentPage>
  );
}
