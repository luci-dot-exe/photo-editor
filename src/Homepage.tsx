import { useEffect, useRef, useState } from "react";
import { OpenCvStatus, getOpenCVStatus } from "./getOpenCvStatus";
import Mat from "opencv-ts/src/core/Mat";

type Coordinates = { channel: number; col: number; row: number };

function createHandler(mat: Mat.Mat) {
  const channels = mat.channels();

  function index2Coordinates(index: number): Coordinates {
    const channel = index % channels;
    const i = Math.floor(index / channels);
    const row = Math.floor(i / mat.cols);
    const col = i % mat.cols;

    return { channel, col, row };
  }

  function coordinates2Index(coordinates: Coordinates): number {
    let index = 0;

    index += coordinates.row * mat.cols;
    index += coordinates.col;
    index *= 4;
    index += coordinates.channel;

    return index;
  }

  return { index2Coordinates, coordinates2Index };
}

export function Homepage() {
  const [pageState, setPageState] = useState<string | null>(null);
  const originalImageRef = useRef<HTMLImageElement>(null);
  const canvasOutputRef = useRef<HTMLCanvasElement>(null);

  const [openCvStatus, setOpenCvStatus] = useState<OpenCvStatus>(
    getOpenCVStatus()
  );

  useEffect(() => {
    const intervalId = setInterval(() => {
      const status = getOpenCVStatus();

      if (status === "READY") {
        clearInterval(intervalId);
      }

      setOpenCvStatus(status);
    }, 100);

    return () => clearInterval(intervalId);
  }, []);

  if (openCvStatus === "LOADING") {
    return <div>Carregando OpenCV...</div>;
  }

  if (openCvStatus === "ERROR") {
    return <div>Erro ao carregar OpenCV :(</div>;
  }

  if (pageState === null) {
    return (
      <div>
        <div className="mb-3">
          <label htmlFor="image-select" className="form-label">
            Selecione uma imagem
          </label>

          <input
            id="image-select"
            type="file"
            accept="image/jpeg"
            className="form-control"
            onChange={(ev) => {
              const file = ev.target.files?.[0];

              if (file === undefined) {
                return;
              }

              const url = URL.createObjectURL(file);
              setPageState(url);
            }}
          />
        </div>
      </div>
    );
  }

  return (
    <div>
      <img
        ref={originalImageRef}
        alt="original file (should not be visible)"
        style={{ display: "none" }}
        src={pageState}
        onLoad={(ev) => {
          if (canvasOutputRef.current === null) {
            return;
          }

          const mat = window.cv.imread(ev.currentTarget);
          window.cv.imshow(canvasOutputRef.current, mat);
          mat.delete();
        }}
      />
      <div className="container">
        <div className="row">
          <div className="col">
            <img alt="original" src={pageState} style={{ maxWidth: 300 }} />
            <div className="caption">Original image</div>
          </div>

          <div className="col">
            <canvas ref={canvasOutputRef} style={{ maxWidth: 300 }}></canvas>
            <div className="caption">Edited image</div>
          </div>
        </div>
      </div>
      <button className="btn btn-secondary" onClick={() => setPageState(null)}>
        Change image
      </button>{" "}
      <button
        className="btn btn-primary"
        onClick={async () => {
          if (canvasOutputRef.current === null) {
            return;
          }

          const mat = window.cv.imread(canvasOutputRef.current);

          if (!mat.isContinuous()) {
            console.error("Not continuous!");
            return;
          }

          const { coordinates2Index, index2Coordinates } = createHandler(mat);

          const target = mat.data.map((_, index, source) => {
            const coordinates = index2Coordinates(index);

            const srcIndex = coordinates2Index({
              ...coordinates,
              row: mat.rows - coordinates.row - 1,
            });

            return source[srcIndex];
          });

          mat.data.set(target, 0);

          window.cv.imshow(canvasOutputRef.current, mat);
          mat.delete();
        }}
      >
        Flip vertically
      </button>{" "}
      <button
        className="btn btn-primary"
        onClick={async () => {
          if (canvasOutputRef.current === null) {
            return;
          }

          const mat = window.cv.imread(canvasOutputRef.current);

          if (!mat.isContinuous()) {
            console.error("Not continuous!");
            return;
          }

          const { coordinates2Index, index2Coordinates } = createHandler(mat);

          const target = mat.data.map((_, index, source) => {
            const coordinates = index2Coordinates(index);

            const srcIndex = coordinates2Index({
              ...coordinates,
              col: mat.cols - coordinates.col - 1,
            });

            return source[srcIndex];
          });

          mat.data.set(target, 0);

          window.cv.imshow(canvasOutputRef.current, mat);
          mat.delete();
        }}
      >
        Flip horizontally
      </button>{" "}
      <button
        className="btn btn-primary"
        onClick={async () => {
          if (canvasOutputRef.current === null) {
            return;
          }

          const imageDataURL = canvasOutputRef.current.toDataURL("image/jpeg");

          const downloadLink = document.createElement("a");
          downloadLink.href = imageDataURL;
          downloadLink.download = "canvas_image.jpg";

          downloadLink.click();
        }}
      >
        download
      </button>
    </div>
  );
}
