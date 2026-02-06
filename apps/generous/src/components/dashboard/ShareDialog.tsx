"use client";

import { Button, Input } from "@generous/ui";
import { useCallback, useEffect, useState } from "react";
import styles from "./ShareDialog.module.css";

interface Collaborator {
  id: string;
  userId: string;
  role: string;
  userName: string;
  userEmail: string;
  userImage?: string;
}

interface Owner {
  userId: string;
  name: string;
  email: string;
  image?: string;
  role: "owner";
}

interface ShareDialogProps {
  dashboardId: string;
  userRole: string;
  onClose: () => void;
}

export function ShareDialog({ dashboardId, userRole, onClose }: ShareDialogProps) {
  const [owner, setOwner] = useState<Owner | null>(null);
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<"viewer" | "editor" | "admin">("viewer");
  const [isInviting, setIsInviting] = useState(false);

  const isOwner = userRole === "owner";
  const isAdmin = userRole === "admin" || isOwner;

  const fetchCollaborators = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/dashboards/${dashboardId}/collaborators`);
      if (response.ok) {
        const data = await response.json();
        setOwner(data.owner);
        setCollaborators(data.collaborators);
      } else {
        setError("Failed to load collaborators");
      }
    } catch (e) {
      setError("Failed to load collaborators");
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  }, [dashboardId]);

  useEffect(() => {
    fetchCollaborators();
  }, [fetchCollaborators]);

  const handleInvite = async () => {
    if (!inviteEmail.trim() || !isAdmin) return;

    setIsInviting(true);
    setError(null);

    try {
      const response = await fetch(`/api/dashboards/${dashboardId}/collaborators`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: inviteEmail, role: inviteRole }),
      });

      if (response.ok) {
        const newCollab = await response.json();
        setCollaborators((prev) => [...prev, newCollab]);
        setInviteEmail("");
      } else {
        const data = await response.json();
        setError(data.error || "Failed to invite user");
      }
    } catch (e) {
      setError("Failed to invite user");
      console.error(e);
    } finally {
      setIsInviting(false);
    }
  };

  const handleRemove = async (userId: string) => {
    if (!isAdmin) return;

    try {
      const response = await fetch(
        `/api/dashboards/${dashboardId}/collaborators?userId=${userId}`,
        { method: "DELETE" },
      );

      if (response.ok) {
        setCollaborators((prev) => prev.filter((c) => c.userId !== userId));
      } else {
        setError("Failed to remove collaborator");
      }
    } catch (e) {
      setError("Failed to remove collaborator");
      console.error(e);
    }
  };

  const handleRoleChange = async (userId: string, newRole: string) => {
    if (!isAdmin) return;

    try {
      const response = await fetch(`/api/dashboards/${dashboardId}/collaborators`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, role: newRole }),
      });

      if (response.ok) {
        setCollaborators((prev) =>
          prev.map((c) => (c.userId === userId ? { ...c, role: newRole } : c)),
        );
      } else {
        setError("Failed to update role");
      }
    } catch (e) {
      setError("Failed to update role");
      console.error(e);
    }
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2 className={styles.title}>Share Dashboard</h2>
          <button type="button" className={styles.closeButton} onClick={onClose}>
            <svg aria-hidden="true" width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path
                d="M5 5L15 15M5 15L15 5"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>

        <div className={styles.body}>
          {error && <div className={styles.error}>{error}</div>}

          {isAdmin && (
            <div className={styles.inviteSection}>
              <h3 className={styles.sectionTitle}>Invite People</h3>
              <div className={styles.inviteForm}>
                <Input
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="Email address"
                  type="email"
                />
                <select
                  className={styles.roleSelect}
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value as typeof inviteRole)}
                >
                  <option value="viewer">Viewer</option>
                  <option value="editor">Editor</option>
                  {isOwner && <option value="admin">Admin</option>}
                </select>
                <Button onClick={handleInvite} disabled={isInviting || !inviteEmail.trim()}>
                  {isInviting ? "Inviting..." : "Invite"}
                </Button>
              </div>
              <p className={styles.roleHint}>
                <strong>Viewer:</strong> Can view only • <strong>Editor:</strong> Can make changes •{" "}
                <strong>Admin:</strong> Can manage collaborators
              </p>
            </div>
          )}

          <div className={styles.peopleSection}>
            <h3 className={styles.sectionTitle}>People with Access</h3>

            {isLoading ? (
              <div className={styles.loading}>Loading...</div>
            ) : (
              <div className={styles.peopleList}>
                {/* Owner */}
                {owner && (
                  <div className={styles.person}>
                    <div className={styles.avatar}>
                      {owner.image ? (
                        // biome-ignore lint/performance/noImgElement: external URL avatar
                        <img src={owner.image} alt={owner.name} />
                      ) : (
                        <span>{owner.name.charAt(0).toUpperCase()}</span>
                      )}
                    </div>
                    <div className={styles.personInfo}>
                      <span className={styles.personName}>{owner.name}</span>
                      <span className={styles.personEmail}>{owner.email}</span>
                    </div>
                    <span className={styles.ownerBadge}>Owner</span>
                  </div>
                )}

                {/* Collaborators */}
                {collaborators.map((collab) => (
                  <div key={collab.id} className={styles.person}>
                    <div className={styles.avatar}>
                      {collab.userImage ? (
                        // biome-ignore lint/performance/noImgElement: external URL avatar
                        <img src={collab.userImage} alt={collab.userName} />
                      ) : (
                        <span>{collab.userName.charAt(0).toUpperCase()}</span>
                      )}
                    </div>
                    <div className={styles.personInfo}>
                      <span className={styles.personName}>{collab.userName}</span>
                      <span className={styles.personEmail}>{collab.userEmail}</span>
                    </div>
                    {isAdmin ? (
                      <>
                        <select
                          className={styles.roleSelectSmall}
                          value={collab.role}
                          onChange={(e) => handleRoleChange(collab.userId, e.target.value)}
                        >
                          <option value="viewer">Viewer</option>
                          <option value="editor">Editor</option>
                          {isOwner && <option value="admin">Admin</option>}
                        </select>
                        <button
                          type="button"
                          className={styles.removeButton}
                          onClick={() => handleRemove(collab.userId)}
                          title="Remove"
                        >
                          <svg
                            aria-hidden="true"
                            width="16"
                            height="16"
                            viewBox="0 0 16 16"
                            fill="none"
                          >
                            <path
                              d="M4 4L12 12M4 12L12 4"
                              stroke="currentColor"
                              strokeWidth="1.5"
                              strokeLinecap="round"
                            />
                          </svg>
                        </button>
                      </>
                    ) : (
                      <span className={styles.roleBadge}>{collab.role}</span>
                    )}
                  </div>
                ))}

                {collaborators.length === 0 && (
                  <p className={styles.noCollaborators}>
                    No collaborators yet. Invite people above to share this dashboard.
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        <div className={styles.footer}>
          <Button variant="ghost" onClick={onClose}>
            Done
          </Button>
        </div>
      </div>
    </div>
  );
}
