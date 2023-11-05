export type OpenCvStatus = "LOADING" | "ERROR" | "READY";
export function getOpenCVStatus(): OpenCvStatus {
  const root = document.getElementById("root");

  if (root === null) return "ERROR";

  const status = root.getAttribute("data-opencv-status");

  if (status === null) return "ERROR";
  if (status !== "LOADING" && status !== "READY") return "ERROR";

  return status;
}
