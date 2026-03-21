const API_BASE = "http://localhost:8000";

// ── Types ──
export type User = {
  id: number;
  email: string;
  name: string;
  role: "super_admin" | "member";
};

export type Workspace = {
  id: number;
  name: string;
  invite_code: string;
};

export type Document = {
  id: number;
  title: string;
  file_type: string;
  file_url: string | null;
  content: string | null;
  created_at: string;
};

export type AIResponse = {
  answer: string;
};

export type GetTokenFn = () => Promise<string | null>;

// ── Core fetch with fresh token + 401 retry ──
async function authFetch(path: string, getToken: GetTokenFn, options?: RequestInit) {
  const doFetch = async () => {
    const token = await getToken();
    if (!token) throw { status: 401, message: "No token available" };

    const res = await fetch(`${API_BASE}${path}`, {
      ...options,
      headers: {
        Authorization: `Bearer ${token}`,
        ...(options?.headers || {}),
      },
    });

    if (!res.ok) {
      const message = await res.text();
      throw { status: res.status, message };
    }

    return res.json();
  };

  try {
    return await doFetch();
  } catch (err: any) {
    if (err?.status === 401) {
      return await doFetch();
    }
    throw err;
  }
}

// ── User ──
export async function getCurrentUser(getToken: GetTokenFn): Promise<User> {
  return authFetch("/me", getToken);
}

// ── Workspaces ──
export async function getWorkspaces(getToken: GetTokenFn): Promise<Workspace[]> {
  return authFetch("/workspace", getToken);
}

export async function createWorkspace(getToken: GetTokenFn, name: string): Promise<{ invite_code: string }> {
  return authFetch("/workspace", getToken, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name }),
  });
}

export async function joinWorkspace(getToken: GetTokenFn, inviteCode: string): Promise<{ message: string }> {
  return authFetch("/workspaces/join", getToken, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ invite_code: inviteCode }),
  });
}

// ── Documents ──
export async function getDocuments(getToken: GetTokenFn, workspaceId: number): Promise<Document[]> {
  return authFetch(`/documents?workspace_id=${workspaceId}`, getToken);
}

export async function uploadDocument(getToken: GetTokenFn, file: File, workspaceId: number) {
  const token = await getToken();
  if (!token) throw { status: 401, message: "No token available" };

  const formData = new FormData();
  formData.append("file", file);
  formData.append("workspace_id", workspaceId.toString());

  const res = await fetch(`${API_BASE}/documents`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });

  if (!res.ok) {
    const message = await res.text();
    throw { status: res.status, message };
  }

  return res.json();
}

export async function createTextDocument(getToken: GetTokenFn, title: string, content: string, workspaceId: number) {
  return authFetch("/documents/text", getToken, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title, content, workspace_id: workspaceId }),
  });
}

// ── AI ──
export async function askAI(getToken: GetTokenFn, workspaceId: number, question: string): Promise<AIResponse> {
  return authFetch("/ai/query", getToken, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ workspace_id: workspaceId, question }),
  });
}

// ── Delete ──
export async function deleteDocument(getToken: GetTokenFn, documentId: number) {
  return authFetch(`/documents/${documentId}`, getToken, { method: "DELETE" });
}

export async function deleteWorkspace(getToken: GetTokenFn, workspaceId: number) {
  return authFetch(`/workspaces/${workspaceId}`, getToken, { method: "DELETE" });
}
