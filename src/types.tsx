import cv from "opencv-ts";

declare global {
  interface Window {
    cv: typeof cv;
  }
}
