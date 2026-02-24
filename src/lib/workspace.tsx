import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";

type Workspace = {
  id: string;
  owner_id: string;
  name: string;
};

type Calendar = {
  id: string;
  workspace_id: string;
  name: string;
  color: string | null;
};

interface WorkspaceContextValue {
  loading: boolean;
  workspaces: Workspace[];
  calendars: Calendar[];
  activeWorkspaceId: string | null;
  activeCalendarId: string | null;
  setActiveWorkspaceId: (id: string | null) => void;
  setActiveCalendarId: (id: string | null) => void;
  reload: () => void;
}

const WorkspaceContext = createContext<WorkspaceContextValue>({
  loading: true,
  workspaces: [],
  calendars: [],
  activeWorkspaceId: null,
  activeCalendarId: null,
  setActiveWorkspaceId: () => {},
  setActiveCalendarId: () => {},
  reload: () => {},
});

const WORKSPACE_STORAGE_KEY = "caly_active_workspace_id";
const CALENDAR_STORAGE_KEY = "caly_active_calendar_id";

export const useWorkspace = () => useContext(WorkspaceContext);

export function WorkspaceProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [calendars, setCalendars] = useState<Calendar[]>([]);
  const [activeWorkspaceId, setActiveWorkspaceIdState] = useState<string | null>(null);
  const [activeCalendarId, setActiveCalendarIdState] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setWorkspaces([]);
      setCalendars([]);
      setActiveWorkspaceIdState(null);
      setActiveCalendarIdState(null);
      setLoading(false);
      return;
    }

    const load = async () => {
      setLoading(true);

      // Fetch workspaces current user can access
      const { data: wsData, error: wsError } = await supabase
        .from("workspaces")
        .select("*")
        .order("created_at", { ascending: true });

      if (wsError) {
        // In case of RLS or schema issues, fail soft but don't crash UI
        console.error("Failed to load workspaces", wsError);
        setWorkspaces([]);
        setCalendars([]);
        setActiveWorkspaceIdState(null);
        setActiveCalendarIdState(null);
        setLoading(false);
        return;
      }

      let workspacesToUse: Workspace[] = wsData as Workspace[];

      // If user has no workspace yet, create a default one with a main calendar
      if (workspacesToUse.length === 0) {
        const { data: newWorkspace, error: createWsError } = await supabase
          .from("workspaces")
          .insert({
            owner_id: user.id,
            name: "My workspace",
          })
          .select("*")
          .single();

        if (createWsError || !newWorkspace) {
          console.error("Failed to create default workspace", createWsError);
          setWorkspaces([]);
          setCalendars([]);
          setActiveWorkspaceIdState(null);
          setActiveCalendarIdState(null);
          setLoading(false);
          return;
        }

        // Make the owner an admin member of the workspace
        await supabase.from("workspace_members").insert({
          workspace_id: newWorkspace.id,
          user_id: user.id,
          role: "admin",
          invited_by: user.id,
        });

        // Create a default calendar
        const { data: newCalendar } = await supabase
          .from("calendars")
          .insert({
            workspace_id: newWorkspace.id,
            name: "Main calendar",
          })
          .select("*")
          .single();

        workspacesToUse = [newWorkspace as Workspace];
        setCalendars(newCalendar ? [newCalendar as Calendar] : []);

        setActiveWorkspaceIdState(newWorkspace.id);
        setActiveCalendarIdState(newCalendar?.id ?? null);
        localStorage.setItem(WORKSPACE_STORAGE_KEY, newWorkspace.id);
        if (newCalendar?.id) {
          localStorage.setItem(CALENDAR_STORAGE_KEY, newCalendar.id);
        }

        setWorkspaces(workspacesToUse);
        setLoading(false);
        return;
      }

      setWorkspaces(workspacesToUse);

      // Fetch calendars for these workspaces
      const workspaceIds = workspacesToUse.map((w) => w.id);
      const { data: calData, error: calError } = await supabase
        .from("calendars")
        .select("*")
        .in("workspace_id", workspaceIds)
        .order("created_at", { ascending: true });

      if (calError) {
        console.error("Failed to load calendars", calError);
        setCalendars([]);
        setActiveWorkspaceIdState(null);
        setActiveCalendarIdState(null);
        setLoading(false);
        return;
      }

      const calendarsToUse = calData as Calendar[];
      setCalendars(calendarsToUse);

      // Restore active workspace/calendar from storage or default to first
      const storedWorkspaceId = localStorage.getItem(WORKSPACE_STORAGE_KEY);
      const storedCalendarId = localStorage.getItem(CALENDAR_STORAGE_KEY);

      const hasStoredWorkspace = storedWorkspaceId && workspacesToUse.some((w) => w.id === storedWorkspaceId);
      const initialWorkspaceId = hasStoredWorkspace ? storedWorkspaceId : workspacesToUse[0]?.id ?? null;

      const workspaceCalendars = calendarsToUse.filter((c) => c.workspace_id === initialWorkspaceId);
      const hasStoredCalendar =
        storedCalendarId && workspaceCalendars.some((c) => c.id === storedCalendarId);
      const initialCalendarId =
        hasStoredCalendar ? storedCalendarId : workspaceCalendars[0]?.id ?? null;

      setActiveWorkspaceIdState(initialWorkspaceId);
      setActiveCalendarIdState(initialCalendarId);

      if (initialWorkspaceId) {
        localStorage.setItem(WORKSPACE_STORAGE_KEY, initialWorkspaceId);
      }
      if (initialCalendarId) {
        localStorage.setItem(CALENDAR_STORAGE_KEY, initialCalendarId);
      }

      setLoading(false);
    };

    const run = () => {
      void load();
    };

    run();

    // expose reload function by mutating a stable reference via state setter callbacks
    // we can't store functions in context default, so we rely on closure below in Provider value

  }, [user]);

  const setActiveWorkspaceId = (id: string | null) => {
    setActiveWorkspaceIdState(id);
    if (id) {
      localStorage.setItem(WORKSPACE_STORAGE_KEY, id);
      // When workspace changes, pick its first calendar as active
      const workspaceCalendars = calendars.filter((c) => c.workspace_id === id);
      const firstCal = workspaceCalendars[0]?.id ?? null;
      setActiveCalendarIdState(firstCal);
      if (firstCal) {
        localStorage.setItem(CALENDAR_STORAGE_KEY, firstCal);
      }
    } else {
      localStorage.removeItem(WORKSPACE_STORAGE_KEY);
    }
  };

  const setActiveCalendarId = (id: string | null) => {
    setActiveCalendarIdState(id);
    if (id) {
      localStorage.setItem(CALENDAR_STORAGE_KEY, id);
    } else {
      localStorage.removeItem(CALENDAR_STORAGE_KEY);
    }
  };

  return (
    <WorkspaceContext.Provider
      value={{
        loading,
        workspaces,
        calendars,
        activeWorkspaceId,
        activeCalendarId,
        setActiveWorkspaceId,
        setActiveCalendarId,
        reload: () => {
          if (!user) return;
          // Re-run the same logic as in the effect
          void (async () => {
            setLoading(true);

            const { data: wsData, error: wsError } = await supabase
              .from("workspaces")
              .select("*")
              .order("created_at", { ascending: true });

            if (wsError) {
              console.error("Failed to reload workspaces", wsError);
              setLoading(false);
              return;
            }

            const workspacesToUse = wsData as Workspace[];
            setWorkspaces(workspacesToUse);

            if (workspacesToUse.length === 0) {
              setCalendars([]);
              setActiveWorkspaceIdState(null);
              setActiveCalendarIdState(null);
              setLoading(false);
              return;
            }

            const workspaceIds = workspacesToUse.map((w) => w.id);
            const { data: calData, error: calError } = await supabase
              .from("calendars")
              .select("*")
              .in("workspace_id", workspaceIds)
              .order("created_at", { ascending: true });

            if (calError) {
              console.error("Failed to reload calendars", calError);
              setLoading(false);
              return;
            }

            const calendarsToUse = calData as Calendar[];
            setCalendars(calendarsToUse);
            setLoading(false);
          })();
        },
      }}
    >
      {children}
    </WorkspaceContext.Provider>
  );
}

