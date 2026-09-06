import { useEffect, useState, type FormEvent } from "react";
import { useAuth } from "../app/AuthContext";
import { Icon } from "../components/Icon";
import { Seo } from "../components/Seo";
import { ApiError } from "../core/api/client";
import {
  listPracticeGoals,
  listTrainingSessions,
  TRAINING_SYNCED_EVENT,
} from "../core/storage/database";
import { accountText } from "../i18n/accountTranslations";
import { useI18n } from "../i18n/I18nContext";
import { TrainingSyncOwnerError } from "../core/sync/trainingSync";

type AccountMode = "login" | "register";

export function AccountPage() {
  const { language } = useI18n();
  const x = (key: string) => accountText(language, key);
  const {
    user,
    authStatus,
    syncStatus,
    lastSyncAt,
    login,
    register,
    logout,
    syncNow,
  } = useAuth();
  const [mode, setMode] = useState<AccountMode>("login");
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [counts, setCounts] = useState({ sessions: 0, goals: 0 });

  useEffect(() => {
    const loadCounts = () => {
      void Promise.all([listTrainingSessions(), listPracticeGoals()]).then(
        ([sessions, goals]) =>
          setCounts({
            sessions: sessions.length,
            goals: goals.filter((goal) => goal.active).length,
          }),
      );
    };
    loadCounts();
    window.addEventListener(TRAINING_SYNCED_EVENT, loadCounts);
    return () => window.removeEventListener(TRAINING_SYNCED_EVENT, loadCounts);
  }, []);

  const localizeError = (caught: unknown) => {
    if (caught instanceof TrainingSyncOwnerError)
      return x("account.errorOwner");
    if (!(caught instanceof ApiError)) return x("account.errorGeneric");
    if (caught.status === 0) return x("account.errorConnect");
    if (caught.status === 401) return x("account.errorCredentials");
    if (caught.status === 409) return x("account.errorExists");
    return x("account.errorGeneric");
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      if (mode === "login") await login(email, password);
      else await register(displayName, email, password);
      setPassword("");
    } catch (caught) {
      setError(localizeError(caught));
    } finally {
      setSubmitting(false);
    }
  };

  const syncLabel =
    syncStatus === "syncing"
      ? x("account.syncing")
      : syncStatus === "synced"
        ? x("account.synced")
        : syncStatus === "offline"
          ? x("account.offline")
          : syncStatus === "error"
            ? x("account.syncError")
            : x("account.local");

  return (
    <div className="page page-narrow account-page">
      <Seo
        title={x("account.title")}
        description={x("account.body")}
        path="/account"
      />
      <div className="page-header">
        <div className="page-title-wrap">
          <div className="eyebrow">{x("account.eyebrow")}</div>
          <h1>{x("account.title")}</h1>
          <p>{x("account.body")}</p>
        </div>
      </div>

      {authStatus === "loading" ? (
        <section className="card panel account-loading" aria-live="polite">
          <span className="sync-dot syncing" />
          {x("account.loggingIn")}
        </section>
      ) : user ? (
        <div className="account-grid">
          <section className="card panel account-profile-card">
            <div className="card-title">
              <h2>{x("account.profile")}</h2>
              <span className="badge account-badge">
                {user.displayName.slice(0, 1).toUpperCase()}
              </span>
            </div>
            <strong className="account-display-name">{user.displayName}</strong>
            <span className="account-email">{user.email}</span>
            <button
              className="button"
              type="button"
              onClick={() => void logout()}
            >
              {x("account.logout")}
            </button>
          </section>

          <section className="card panel account-sync-card">
            <div className="card-title">
              <h2>{x("account.syncTitle")}</h2>
              <span className={`sync-pill ${syncStatus}`}>
                <span className="sync-dot" />
                {syncLabel}
              </span>
            </div>
            <p className="hint">{x("account.syncBody")}</p>
            <div className="account-counts">
              <div>
                <strong>{counts.sessions}</strong>
                <span>{x("account.sessions")}</span>
              </div>
              <div>
                <strong>{counts.goals}</strong>
                <span>{x("account.goals")}</span>
              </div>
            </div>
            <div className="account-sync-actions">
              <span>
                {x("account.lastSync")}:{" "}
                {lastSyncAt
                  ? new Date(lastSyncAt).toLocaleString(
                      language === "zh" ? "zh-CN" : undefined,
                    )
                  : x("account.never")}
              </span>
              <button
                className="button button-primary"
                type="button"
                disabled={syncStatus === "syncing"}
                onClick={() =>
                  void syncNow().catch((caught) =>
                    setError(localizeError(caught)),
                  )
                }
              >
                <Icon name="upload" />
                {syncStatus === "syncing"
                  ? x("account.syncing")
                  : x("account.syncNow")}
              </button>
            </div>
            {error ? (
              <p className="form-error" role="alert">
                {error}
              </p>
            ) : null}
          </section>
        </div>
      ) : (
        <section className="card panel auth-card">
          <div className="auth-intro">
            <div>
              <h2>{x("account.guestTitle")}</h2>
              <p className="hint">{x("account.guestBody")}</p>
            </div>
            <div className="auth-tabs" role="tablist">
              <button
                type="button"
                role="tab"
                aria-selected={mode === "login"}
                className={mode === "login" ? "active" : ""}
                onClick={() => {
                  setMode("login");
                  setError("");
                }}
              >
                {x("account.login")}
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={mode === "register"}
                className={mode === "register" ? "active" : ""}
                onClick={() => {
                  setMode("register");
                  setError("");
                }}
              >
                {x("account.register")}
              </button>
            </div>
          </div>

          <form className="auth-form" onSubmit={(event) => void submit(event)}>
            {mode === "register" ? (
              <label className="field">
                <span>{x("account.name")}</span>
                <input
                  name="name"
                  autoComplete="name"
                  maxLength={80}
                  required
                  value={displayName}
                  onChange={(event) => setDisplayName(event.target.value)}
                />
              </label>
            ) : null}
            <label className="field">
              <span>{x("account.email")}</span>
              <input
                name="email"
                type="email"
                autoComplete="email"
                maxLength={254}
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
            </label>
            <label className="field">
              <span>{x("account.password")}</span>
              <input
                name="password"
                type="password"
                autoComplete={
                  mode === "login" ? "current-password" : "new-password"
                }
                minLength={10}
                maxLength={200}
                required
                value={password}
                onChange={(event) => setPassword(event.target.value)}
              />
              <small>{x("account.passwordHelp")}</small>
            </label>
            {error ? (
              <p className="form-error" role="alert">
                {error}
              </p>
            ) : null}
            <button
              className="button button-primary button-wide"
              type="submit"
              disabled={submitting}
            >
              <Icon name="users" />
              {submitting
                ? mode === "login"
                  ? x("account.loggingIn")
                  : x("account.registering")
                : mode === "login"
                  ? x("account.login")
                  : x("account.register")}
            </button>
          </form>
        </section>
      )}

      <section className="card panel account-privacy-card">
        <Icon name="shield" />
        <div>
          <h2>{x("account.privacyTitle")}</h2>
          <p className="hint">{x("account.privacyBody")}</p>
        </div>
      </section>
    </div>
  );
}
