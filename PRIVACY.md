# Privacy

OpenVox Studio is designed as a local-first browser application.

## Core audio processing

Microphone frames used by the live studio, vocal training, tuner and analysis tools are processed through browser audio APIs and the local pitch-analysis pipeline. The application does not require an OpenVox server endpoint for audio processing.

## Local storage

OpenVox may store the following in the browser's IndexedDB or local settings storage:

- projects and scores;
- explicitly saved recordings;
- application and audio preferences;
- training sessions;
- practice goals;
- locally created instrument tunings and audio-lab presets.

The user can export project or audio files to the device. Clearing site data in the browser can remove locally stored information that has not been exported.

## Optional accounts and practice synchronization

Guest mode remains local and does not require an account. After a user explicitly creates an account or signs in, OpenVox synchronizes training-session summaries and practice goals with the self-hosted OpenVox API. Synced summaries can include exercise details, timestamps, duration, accuracy metrics, target notes and user-entered session notes.

Raw microphone frames, recording blobs, imported audio, score documents and projects are not uploaded by this synchronization feature. Passwords are stored as salted scrypt hashes and browser sessions use an HttpOnly, SameSite=Lax cookie. Non-localhost deployments must use HTTPS and secure cookies.

## Imported files

Audio, MusicXML, MIDI and OpenVox project files are read locally by the application. They are not uploaded by the core import workflow.

## Analytics and tracking

The standard web deployment does not load Google Analytics or another tracking service. Audio frames, score content, recording blobs and project data remain outside third-party analytics workflows.

Deployment operators who add their own telemetry are responsible for documenting it, obtaining any required consent and keeping private audio or project content out of analytics events.

## Optional browser speech recognition

Voice-command functionality is disabled by default. When explicitly enabled, it uses the browser's speech-recognition implementation. Depending on the browser and platform, speech recognition may use a remote browser-vendor service. This feature is therefore not classified as part of the guaranteed local audio-processing path.

## Browser permissions

Microphone and MIDI permissions are controlled by the browser. OpenVox requests them only when a feature needs them.

For a more detailed data-flow description, see [docs/PRIVACY_MODEL.md](docs/PRIVACY_MODEL.md).
