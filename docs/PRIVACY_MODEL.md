# Privacy model

## Data-flow summary

```text
Microphone -> browser audio graph -> local analysis -> interface
                                      |
                                      +-> optional local IndexedDB recording/session data

Imported files -> browser file APIs -> local parser/decoder -> local project state

Explicit export -> browser download -> user's device

Optional sign-in -> same-origin API -> account/session records in PostgreSQL
Logged-in practice summary/goal sync -> same-origin API -> PostgreSQL
```

The audio path does not require the OpenVox API. Guest mode remains fully local. The API is used only when a user creates an account or signs in to synchronize practice summaries and goals.

## Data stored locally

Depending on usage, the site can persist:

- project metadata and score events;
- user settings;
- room noise calibration;
- saved recording blobs;
- training session summaries;
- weekly practice goals;
- custom instrument tunings;
- advanced audio-lab presets.

Storage is scoped to the site's browser origin.

## Data leaving the device

### Optional account sync

After explicit registration or sign-in, OpenVox synchronizes training-session summaries and practice goals. A summary can include the exercise name, category, duration, timestamps, accuracy, hit rate, cents statistics, score, target note and user-entered session notes. Raw microphone frames, recording blobs, imported audio, scores and projects are not part of this first synchronization phase.

Passwords are stored as salted scrypt hashes. Browser sessions use an HttpOnly, SameSite=Lax cookie. Deployments outside localhost must use HTTPS and enable secure cookies.

### Static hosting

The browser downloads application assets from the hosting origin, such as GitHub Pages.

### Analytics

The standard web deployment does not load Google Analytics or another tracking service. Microphone frames, score documents, project data and recording blobs are not sent through a telemetry integration.

### Optional speech recognition

Browser speech recognition is opt-in and is not guaranteed to be local because the browser vendor controls its implementation.

### User-initiated links

Opening a source or other external link navigates to a separate site under the user's control.

## Threat boundaries

Users and deployment operators should consider:

- any script served by the deployment origin can access application-origin browser storage;
- browser extensions may have broad page permissions;
- exported project/audio files inherit the security of the device location where they are saved;
- shared computers should not be assumed private after local data is stored.
- the self-hosted PostgreSQL operator can access synchronized account and practice data;
- deleting browser site data does not delete synchronized server records.

## Self-hosting

The static client can still be hosted without the optional API, in which case account features are unavailable and guest mode continues to work. Deployers are responsible for database backups, HTTPS, access control, retention and a process for account-data deletion.
