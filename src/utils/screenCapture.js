export class ScreenCapture {
    constructor() {
        this.mediaStream = null;
        this.videoTrack = null;
        this.audioTracks = [];
        this.isPaused = false;

        // Callbacks for external use
        this.onStreamStarted = null; // (stream) => {}
        this.onStreamStopped = null; // (wasPaused) => {}
        this.onStreamPaused = null; // () => {}
        this.onStreamResumed = null; // () => {}
        this.onError = null;         // (error) => {}
    }

    async start(options = { video: true, audio: false }) {
        console.log("Requesting display media with options:", options);
        try {
            // Basic validation moved inside
            if (!options.video && !options.audio) {
                throw new Error("You must select at least Video or Audio to capture.");
            }

            this.mediaStream = await navigator.mediaDevices.getDisplayMedia(options);
            this.videoTrack = this.mediaStream.getVideoTracks()[0];
            this.audioTracks = this.mediaStream.getAudioTracks();
            this.isPaused = false;

            // Attach 'ended' listener to stop automatically if user stops sharing via browser UI
            const trackToMonitor = this.videoTrack || (this.audioTracks.length > 0 ? this.audioTracks[0] : null);
            if (trackToMonitor) {
                trackToMonitor.addEventListener('ended', () => this.stop(false)); // Pass false as it wasn't paused by our controls
            }

            if (this.onStreamStarted) {
                this.onStreamStarted(this.mediaStream);
            }

        } catch (err) {
            console.error("Error starting screen capture:", err);
            this.resetState();
            if (this.onError) {
                this.onError(err);
            } else {
                // Re-throw if no custom error handler is provided
                throw err;
            }
        }
    }

    pause() {
        if (this.videoTrack && this.videoTrack.enabled && !this.isPaused) {
            this.videoTrack.enabled = false;
            this.isPaused = true;
            console.log("Capture paused");
            if (this.onStreamPaused) {
                this.onStreamPaused();
            }
        }
    }

    resume() {
        if (this.videoTrack && !this.videoTrack.enabled && this.isPaused) {
            this.videoTrack.enabled = true;
            this.isPaused = false;
            console.log("Capture resumed");
            if (this.onStreamResumed) {
                this.onStreamResumed();
            }
        }
    }

    stop(wasPausedBeforeStopping = this.isPaused) {
        if (this.mediaStream) {
            this.mediaStream.getTracks().forEach(track => track.stop());
            console.log("Capture stopped");
            const wasPaused = wasPausedBeforeStopping; // Capture state before resetting
            this.resetState();
            if (this.onStreamStopped) {
                this.onStreamStopped(wasPaused); // Pass the paused state
            }
        }
    }

    resetState() {
        this.mediaStream = null;
        this.videoTrack = null;
        this.audioTracks = [];
        this.isPaused = false;
    }

    get hasVideo() {
        return !!this.videoTrack;
    }

    get streamActive() {
        return !!this.mediaStream;
    }
    
    getStream() {
        return this.mediaStream;
    }
}

export const screenCapture = new ScreenCapture();