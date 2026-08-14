import uitoolkit, { CustomizationOptions } from "@zoom/videosdk-ui-toolkit";
import "@zoom/videosdk-ui-toolkit/dist/videosdk-ui-toolkit.css";
import "./App.css";

function App() {
  let sessionContainer: HTMLDivElement | null = null;
  // set your auth endpoint here
  // a sample is available here: https://github.com/zoom/videosdk-auth-endpoint-sample
  const authEndpoint = "https://be.di-ichi.edu.vn/zoom-token"; // http://localhost:4000
  const config: CustomizationOptions = {
    videoSDKJWT: "",
    sessionName: "test",
    userName: "React",
    sessionPasscode: "123",
    featuresOptions: {
      preview: {
        enable: true,
      },
      virtualBackground: {
        enable: true,
        virtualBackgrounds: [
          {
            url: "https://images.unsplash.com/photo-1715490187538-30a365fa05bd?q=80&w=1945&auto=format&fit=crop",
          },
        ],
      },
    },
  };
  const role = 1;

  async function getVideoSDKJWT() {
    sessionContainer = document.getElementById(
      "sessionContainer",
    ) as HTMLDivElement;

    try {
      const response = await fetch(authEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization:
            "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2ZWU1ZDZkMC04YjJiLTQ3OGUtODliMy1kY2YxNmY3MGFjYmEiLCJ1c2VyVHlwZSI6IkFETUlOIiwiZGV2aWNlSWQiOiI0OWFkMGRkMC1kYTlmLTRhY2UtYjkxZi01OTdmNWRhZWVmYjQiLCJpYXQiOjE3ODY2NzM3NTksImV4cCI6MTc4OTI2NTc1OX0.HmO7ukwOkIDFsBdfQghw3vhgX1HVwFpkuIgHBhTMT0A",
        },
        body: JSON.stringify({
          sessionName: config.sessionName,
          role,
          userIdentity: config.userName,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const result = await response.json();
      console.log("Zoom response:", result);

      const token = result.data?.token;

      if (!token) {
        throw new Error("Backend không trả về Video SDK token");
      }

      config.videoSDKJWT = token;
      document.getElementById("join-flow")!.style.display = "none";

      await joinSession();
    } catch (error) {
      console.error("Zoom token error:", error);
      document.getElementById("join-flow")!.style.display = "block";
    }
  }

  async function joinSession() {
    if (!sessionContainer) {
      console.error("Không tìm thấy sessionContainer");
      return;
    }

    try {
      console.log("Joining Zoom...", config);

      await uitoolkit.joinSession(sessionContainer, config);

      uitoolkit.onSessionClosed(sessionClosed);
      uitoolkit.onSessionDestroyed(sessionDestroyed);

      console.log("Zoom joined");
    } catch (error) {
      console.error("Zoom join error:", error);
      document.getElementById("join-flow")!.style.display = "block";
    }
  }

  const sessionClosed = () => {
    console.log("session closed");
    document.getElementById("join-flow")!.style.display = "block";
  };

  const sessionDestroyed = () => {
    console.log("session destroyed");
    uitoolkit.destroy();
  };

  return (
    <div className="App">
      <main>
        <div id="join-flow">
          <h1>Zoom Video SDK Sample React</h1>
          <p>User interface offered by the Video SDK UI Toolkit</p>
          <button onClick={getVideoSDKJWT}>Join Session</button>
        </div>
        <div id="sessionContainer"></div>
      </main>
    </div>
  );
}

export default App;
