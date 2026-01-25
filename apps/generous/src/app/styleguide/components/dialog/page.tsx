"use client";

import { Button, Dialog } from "@generous/ui";
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

const dialogProps = [
  {
    name: "open",
    type: "boolean",
    description: "Controlled open state of the dialog",
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
    name: "modal",
    type: "boolean",
    defaultValue: "true",
    description: "Whether the dialog blocks interaction with the rest of the page",
  },
];

const basicExample = `import { Dialog, Button } from "@generous/ui";

function Example() {
  return (
    <Dialog.Root>
      <Dialog.Trigger asChild>
        <Button>Open Dialog</Button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay />
        <Dialog.Content>
          <Dialog.Header>
            <Dialog.Title>Dialog Title</Dialog.Title>
            <Dialog.Description>
              This is a description of the dialog content.
            </Dialog.Description>
          </Dialog.Header>
          <Dialog.Footer>
            <Dialog.Close asChild>
              <Button variant="outline">Cancel</Button>
            </Dialog.Close>
            <Button>Confirm</Button>
          </Dialog.Footer>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}`;

const controlledExample = `import { useState } from "react";
import { Dialog, Button } from "@generous/ui";

function ControlledDialog() {
  const [open, setOpen] = useState(false);

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        <Button>Open Dialog</Button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay />
        <Dialog.Content>
          <Dialog.Header>
            <Dialog.Title>Controlled Dialog</Dialog.Title>
            <Dialog.Description>
              This dialog's state is controlled externally.
            </Dialog.Description>
          </Dialog.Header>
          <Dialog.Footer>
            <Button onClick={() => setOpen(false)}>Close</Button>
          </Dialog.Footer>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}`;

export default function DialogPage() {
  const [basicOpen, setBasicOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [formOpen, setFormOpen] = useState(false);

  return (
    <ComponentPage
      name="Dialog"
      description="A modal dialog that overlays the page content. Built on Base UI for accessibility with focus trapping, escape key handling, and screen reader support."
      category="Overlay"
      usesBaseUI
      baseUIUrl="https://base-ui.com/react/components/dialog"
    >
      <Section title="Interactive Demo">
        <PreviewBox>
          <div className={styles.demoButtons}>
            <Button onClick={() => setBasicOpen(true)}>Basic Dialog</Button>
            <Button onClick={() => setConfirmOpen(true)} variant="outline">
              Confirmation
            </Button>
            <Button onClick={() => setFormOpen(true)} variant="secondary">
              With Form
            </Button>
          </div>

          {/* Basic Dialog */}
          <Dialog.Root open={basicOpen} onOpenChange={setBasicOpen}>
            <Dialog.Portal>
              <Dialog.Overlay />
              <Dialog.Content>
                <Dialog.Header>
                  <Dialog.Title>Basic Dialog</Dialog.Title>
                  <Dialog.Description>
                    This is a basic dialog with a title, description, and actions.
                  </Dialog.Description>
                </Dialog.Header>
                <Dialog.Footer>
                  <Dialog.Close asChild>
                    <Button variant="outline">Cancel</Button>
                  </Dialog.Close>
                  <Button onClick={() => setBasicOpen(false)}>Confirm</Button>
                </Dialog.Footer>
              </Dialog.Content>
            </Dialog.Portal>
          </Dialog.Root>

          {/* Confirmation Dialog */}
          <Dialog.Root open={confirmOpen} onOpenChange={setConfirmOpen}>
            <Dialog.Portal>
              <Dialog.Overlay />
              <Dialog.Content>
                <Dialog.Header>
                  <Dialog.Title>Delete Item?</Dialog.Title>
                  <Dialog.Description>
                    This action cannot be undone. This will permanently delete the item from your
                    account.
                  </Dialog.Description>
                </Dialog.Header>
                <Dialog.Footer>
                  <Dialog.Close asChild>
                    <Button variant="outline">Cancel</Button>
                  </Dialog.Close>
                  <Button variant="destructive" onClick={() => setConfirmOpen(false)}>
                    Delete
                  </Button>
                </Dialog.Footer>
              </Dialog.Content>
            </Dialog.Portal>
          </Dialog.Root>

          {/* Form Dialog */}
          <Dialog.Root open={formOpen} onOpenChange={setFormOpen}>
            <Dialog.Portal>
              <Dialog.Overlay />
              <Dialog.Content>
                <Dialog.Header>
                  <Dialog.Title>Edit Profile</Dialog.Title>
                  <Dialog.Description>Make changes to your profile here.</Dialog.Description>
                </Dialog.Header>
                <div className={styles.formContent}>
                  <div className={styles.formField}>
                    <label className={styles.label}>Name</label>
                    <input type="text" className={styles.input} defaultValue="John Doe" />
                  </div>
                  <div className={styles.formField}>
                    <label className={styles.label}>Email</label>
                    <input type="email" className={styles.input} defaultValue="john@example.com" />
                  </div>
                </div>
                <Dialog.Footer>
                  <Dialog.Close asChild>
                    <Button variant="outline">Cancel</Button>
                  </Dialog.Close>
                  <Button onClick={() => setFormOpen(false)}>Save Changes</Button>
                </Dialog.Footer>
              </Dialog.Content>
            </Dialog.Portal>
          </Dialog.Root>
        </PreviewBox>
      </Section>

      <Section title="Usage" description="Basic usage pattern for the Dialog component.">
        <CodeExample code={basicExample} title="Basic Dialog" />
      </Section>

      <Section
        title="Controlled State"
        description="Control the dialog open state externally for programmatic control."
      >
        <CodeExample code={controlledExample} title="Controlled Dialog" />
      </Section>

      <Section title="Anatomy">
        <VariantGrid columns={2}>
          <VariantCard title="Dialog.Root" description="Provides context for all dialog parts">
            <code className={styles.anatomy}>{"<Dialog.Root>"}</code>
          </VariantCard>
          <VariantCard title="Dialog.Trigger" description="Button that opens the dialog">
            <code className={styles.anatomy}>{"<Dialog.Trigger>"}</code>
          </VariantCard>
          <VariantCard title="Dialog.Portal" description="Renders dialog outside the DOM hierarchy">
            <code className={styles.anatomy}>{"<Dialog.Portal>"}</code>
          </VariantCard>
          <VariantCard title="Dialog.Overlay" description="Semi-transparent backdrop">
            <code className={styles.anatomy}>{"<Dialog.Overlay>"}</code>
          </VariantCard>
          <VariantCard title="Dialog.Content" description="The main dialog container">
            <code className={styles.anatomy}>{"<Dialog.Content>"}</code>
          </VariantCard>
          <VariantCard
            title="Dialog.Header / Title / Description"
            description="Header section with title and description"
          >
            <code className={styles.anatomy}>{"<Dialog.Header>"}</code>
          </VariantCard>
          <VariantCard title="Dialog.Footer" description="Footer section for actions">
            <code className={styles.anatomy}>{"<Dialog.Footer>"}</code>
          </VariantCard>
          <VariantCard title="Dialog.Close" description="Button that closes the dialog">
            <code className={styles.anatomy}>{"<Dialog.Close>"}</code>
          </VariantCard>
        </VariantGrid>
      </Section>

      <Section title="Props">
        <PropsTable componentName="Dialog.Root" props={dialogProps} />
      </Section>

      <Section title="Accessibility">
        <ul className={styles.accessibilityList}>
          <li>Automatically traps focus within the dialog when open</li>
          <li>Closes on Escape key press</li>
          <li>Closes when clicking the overlay (configurable)</li>
          <li>
            Uses <code>role="dialog"</code> and <code>aria-modal="true"</code>
          </li>
          <li>Title and description are linked via ARIA attributes</li>
          <li>Returns focus to trigger element when closed</li>
          <li>Body scroll is prevented when modal is open</li>
        </ul>
      </Section>
    </ComponentPage>
  );
}
