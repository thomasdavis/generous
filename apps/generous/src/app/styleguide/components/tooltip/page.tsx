"use client";

import { Button, Tooltip } from "@generous/ui";
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

const tooltipProps = [
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
    defaultValue: "400",
    description: "Delay before showing (ms)",
  },
  {
    name: "closeDelay",
    type: "number",
    defaultValue: "0",
    description: "Delay before hiding (ms)",
  },
];

const positionerProps = [
  {
    name: "side",
    type: '"top" | "right" | "bottom" | "left"',
    defaultValue: '"top"',
    description: "Preferred side to position the tooltip",
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
    defaultValue: "6",
    description: "Distance from the trigger",
  },
];

const basicExample = `import { Tooltip, Button } from "@generous/ui";

function Example() {
  return (
    <Tooltip.Root>
      <Tooltip.Trigger asChild>
        <Button>Hover me</Button>
      </Tooltip.Trigger>
      <Tooltip.Portal>
        <Tooltip.Positioner>
          <Tooltip.Content>
            Helpful tooltip text
          </Tooltip.Content>
        </Tooltip.Positioner>
      </Tooltip.Portal>
    </Tooltip.Root>
  );
}`;

const providerExample = `import { Tooltip } from "@generous/ui";

// Use a Provider to set default delay for all tooltips
function App() {
  return (
    <Tooltip.Provider delay={200}>
      <Tooltip.Root>
        <Tooltip.Trigger>...</Tooltip.Trigger>
        <Tooltip.Portal>
          <Tooltip.Positioner>
            <Tooltip.Content>Fast tooltip</Tooltip.Content>
          </Tooltip.Positioner>
        </Tooltip.Portal>
      </Tooltip.Root>
    </Tooltip.Provider>
  );
}`;

export default function TooltipPage() {
  return (
    <ComponentPage
      name="Tooltip"
      description="A popup that displays additional information when hovering or focusing on an element. Built on Base UI for accessible keyboard support and smart positioning."
      category="Overlay"
      usesBaseUI
      baseUIUrl="https://base-ui.com/react/components/tooltip"
    >
      <Section title="Interactive Demo">
        <PreviewBox>
          <div className={styles.demoGrid}>
            <Tooltip.Root>
              <Tooltip.Trigger asChild>
                <Button>Hover for tooltip</Button>
              </Tooltip.Trigger>
              <Tooltip.Portal>
                <Tooltip.Positioner>
                  <Tooltip.Content>This is a helpful tooltip</Tooltip.Content>
                </Tooltip.Positioner>
              </Tooltip.Portal>
            </Tooltip.Root>

            <Tooltip.Root delay={0}>
              <Tooltip.Trigger asChild>
                <Button variant="outline">Instant tooltip</Button>
              </Tooltip.Trigger>
              <Tooltip.Portal>
                <Tooltip.Positioner>
                  <Tooltip.Content>No delay on this one</Tooltip.Content>
                </Tooltip.Positioner>
              </Tooltip.Portal>
            </Tooltip.Root>
          </div>
        </PreviewBox>
      </Section>

      <Section title="Positioning">
        <VariantGrid columns={4}>
          <VariantCard title="Top" description="Default position">
            <Tooltip.Root delay={0}>
              <Tooltip.Trigger asChild>
                <Button variant="outline" size="sm">
                  Top
                </Button>
              </Tooltip.Trigger>
              <Tooltip.Portal>
                <Tooltip.Positioner side="top">
                  <Tooltip.Content>Top tooltip</Tooltip.Content>
                </Tooltip.Positioner>
              </Tooltip.Portal>
            </Tooltip.Root>
          </VariantCard>
          <VariantCard title="Right" description="Right side">
            <Tooltip.Root delay={0}>
              <Tooltip.Trigger asChild>
                <Button variant="outline" size="sm">
                  Right
                </Button>
              </Tooltip.Trigger>
              <Tooltip.Portal>
                <Tooltip.Positioner side="right">
                  <Tooltip.Content>Right tooltip</Tooltip.Content>
                </Tooltip.Positioner>
              </Tooltip.Portal>
            </Tooltip.Root>
          </VariantCard>
          <VariantCard title="Bottom" description="Below trigger">
            <Tooltip.Root delay={0}>
              <Tooltip.Trigger asChild>
                <Button variant="outline" size="sm">
                  Bottom
                </Button>
              </Tooltip.Trigger>
              <Tooltip.Portal>
                <Tooltip.Positioner side="bottom">
                  <Tooltip.Content>Bottom tooltip</Tooltip.Content>
                </Tooltip.Positioner>
              </Tooltip.Portal>
            </Tooltip.Root>
          </VariantCard>
          <VariantCard title="Left" description="Left side">
            <Tooltip.Root delay={0}>
              <Tooltip.Trigger asChild>
                <Button variant="outline" size="sm">
                  Left
                </Button>
              </Tooltip.Trigger>
              <Tooltip.Portal>
                <Tooltip.Positioner side="left">
                  <Tooltip.Content>Left tooltip</Tooltip.Content>
                </Tooltip.Positioner>
              </Tooltip.Portal>
            </Tooltip.Root>
          </VariantCard>
        </VariantGrid>
      </Section>

      <Section title="Usage">
        <CodeExample code={basicExample} title="Basic Tooltip" />
      </Section>

      <Section title="Provider">
        <CodeExample code={providerExample} title="Using Tooltip.Provider" />
      </Section>

      <Section title="Props">
        <PropsTable componentName="Tooltip.Root" props={tooltipProps} />
        <div style={{ marginTop: "var(--space-6)" }}>
          <PropsTable componentName="Tooltip.Positioner" props={positionerProps} />
        </div>
      </Section>

      <Section title="Accessibility">
        <ul className={styles.accessibilityList}>
          <li>Shows on hover and focus for keyboard users</li>
          <li>Hides when pressing Escape</li>
          <li>
            Uses <code>role="tooltip"</code> and links via <code>aria-describedby</code>
          </li>
          <li>Configurable delay prevents flickering on accidental hover</li>
          <li>Smart positioning keeps tooltip in viewport</li>
          <li>Non-interactive - pointer events pass through</li>
        </ul>
      </Section>
    </ComponentPage>
  );
}
