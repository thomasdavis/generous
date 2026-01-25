"use client";

import { Tabs } from "@generous/ui";
import { useState } from "react";
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

const tabsProps = [
  {
    name: "value",
    type: "string | number",
    description: "Controlled active tab value",
  },
  {
    name: "defaultValue",
    type: "string | number",
    description: "Default active tab (uncontrolled)",
  },
  {
    name: "onValueChange",
    type: "(value: string | number) => void",
    description: "Callback when active tab changes",
  },
  {
    name: "orientation",
    type: '"horizontal" | "vertical"',
    defaultValue: '"horizontal"',
    description: "Orientation of the tabs",
  },
];

const tabsListProps = [
  {
    name: "loop",
    type: "boolean",
    defaultValue: "true",
    description: "Whether keyboard navigation loops around",
  },
  {
    name: "activateOnFocus",
    type: "boolean",
    defaultValue: "true",
    description: "Whether to activate tab on focus",
  },
];

const basicExample = `import { Tabs } from "@generous/ui";

function Example() {
  return (
    <Tabs.Root defaultValue="tab1">
      <Tabs.List>
        <Tabs.Trigger value="tab1">Account</Tabs.Trigger>
        <Tabs.Trigger value="tab2">Security</Tabs.Trigger>
        <Tabs.Trigger value="tab3">Notifications</Tabs.Trigger>
      </Tabs.List>
      <Tabs.Content value="tab1">
        <p>Account settings content</p>
      </Tabs.Content>
      <Tabs.Content value="tab2">
        <p>Security settings content</p>
      </Tabs.Content>
      <Tabs.Content value="tab3">
        <p>Notification preferences</p>
      </Tabs.Content>
    </Tabs.Root>
  );
}`;

const verticalExample = `import { Tabs } from "@generous/ui";

function VerticalTabs() {
  return (
    <Tabs.Root defaultValue="general" orientation="vertical">
      <Tabs.List>
        <Tabs.Trigger value="general">General</Tabs.Trigger>
        <Tabs.Trigger value="appearance">Appearance</Tabs.Trigger>
        <Tabs.Trigger value="advanced">Advanced</Tabs.Trigger>
      </Tabs.List>
      <Tabs.Content value="general">General settings</Tabs.Content>
      <Tabs.Content value="appearance">Appearance settings</Tabs.Content>
      <Tabs.Content value="advanced">Advanced settings</Tabs.Content>
    </Tabs.Root>
  );
}`;

export default function TabsPage() {
  const [activeTab, setActiveTab] = useState("tab1");

  return (
    <ComponentPage
      name="Tabs"
      description="A set of layered sections of content, known as tab panels, that display one panel at a time. Built on Base UI for accessible keyboard navigation."
      category="Navigation"
      usesBaseUI
      baseUIUrl="https://base-ui.com/react/components/tabs"
    >
      <Section title="Interactive Demo">
        <PreviewBox>
          <div className={styles.demoContainer}>
            <Tabs.Root value={activeTab} onValueChange={(v) => setActiveTab(String(v))}>
              <Tabs.List>
                <Tabs.Trigger value="tab1">Account</Tabs.Trigger>
                <Tabs.Trigger value="tab2">Security</Tabs.Trigger>
                <Tabs.Trigger value="tab3">Notifications</Tabs.Trigger>
                <Tabs.Trigger value="tab4" disabled>
                  Disabled
                </Tabs.Trigger>
              </Tabs.List>
              <Tabs.Content value="tab1">
                <div className={styles.tabContent}>
                  <h3>Account Settings</h3>
                  <p>Manage your account information and preferences.</p>
                </div>
              </Tabs.Content>
              <Tabs.Content value="tab2">
                <div className={styles.tabContent}>
                  <h3>Security Settings</h3>
                  <p>Configure your security and privacy options.</p>
                </div>
              </Tabs.Content>
              <Tabs.Content value="tab3">
                <div className={styles.tabContent}>
                  <h3>Notification Preferences</h3>
                  <p>Control how and when you receive notifications.</p>
                </div>
              </Tabs.Content>
            </Tabs.Root>
          </div>
        </PreviewBox>
      </Section>

      <Section title="Orientation">
        <VariantGrid columns={2}>
          <VariantCard title="Horizontal" description="Default horizontal layout">
            <div className={styles.orientationDemo}>
              <Tabs.Root defaultValue="1" orientation="horizontal">
                <Tabs.List>
                  <Tabs.Trigger value="1">Tab 1</Tabs.Trigger>
                  <Tabs.Trigger value="2">Tab 2</Tabs.Trigger>
                  <Tabs.Trigger value="3">Tab 3</Tabs.Trigger>
                </Tabs.List>
                <Tabs.Content value="1">Content 1</Tabs.Content>
                <Tabs.Content value="2">Content 2</Tabs.Content>
                <Tabs.Content value="3">Content 3</Tabs.Content>
              </Tabs.Root>
            </div>
          </VariantCard>
          <VariantCard title="Vertical" description="Vertical layout for sidebars">
            <div className={styles.orientationDemo}>
              <Tabs.Root defaultValue="1" orientation="vertical">
                <Tabs.List>
                  <Tabs.Trigger value="1">Tab 1</Tabs.Trigger>
                  <Tabs.Trigger value="2">Tab 2</Tabs.Trigger>
                  <Tabs.Trigger value="3">Tab 3</Tabs.Trigger>
                </Tabs.List>
                <Tabs.Content value="1">Content 1</Tabs.Content>
                <Tabs.Content value="2">Content 2</Tabs.Content>
                <Tabs.Content value="3">Content 3</Tabs.Content>
              </Tabs.Root>
            </div>
          </VariantCard>
        </VariantGrid>
      </Section>

      <Section title="Usage">
        <CodeExample code={basicExample} title="Basic Tabs" />
      </Section>

      <Section title="Vertical Tabs">
        <CodeExample code={verticalExample} title="Vertical Orientation" />
      </Section>

      <Section title="Props">
        <PropsTable componentName="Tabs.Root" props={tabsProps} />
        <div style={{ marginTop: "var(--space-6)" }}>
          <PropsTable componentName="Tabs.List" props={tabsListProps} />
        </div>
      </Section>

      <Section title="Accessibility">
        <ul className={styles.accessibilityList}>
          <li>Arrow key navigation between tabs</li>
          <li>Home/End keys jump to first/last tab</li>
          <li>Tab key moves focus into and out of the tab list</li>
          <li>
            Uses <code>role="tablist"</code>, <code>role="tab"</code>, and{" "}
            <code>role="tabpanel"</code>
          </li>
          <li>Proper aria-selected and aria-controls attributes</li>
          <li>Supports disabled tabs</li>
          <li>Optional activation on focus vs. on click</li>
        </ul>
      </Section>
    </ComponentPage>
  );
}
