import { useEffect, useRef, useState } from "react";
import { OpenCvStatus, getOpenCVStatus } from "./getOpenCvStatus";
import Mat from "opencv-ts/src/core/Mat";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowsAltV,
  faArrowsAltH,
  faPalette,
  faDownload,
  faImage,
} from "@fortawesome/free-solid-svg-icons";
import defaultImage from "./img/Underwater_53k.jpg";

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

function range(value: number) {
  return new Array(value).fill(null).map((_, index) => index);
}

export function Homepage() {
  const [pageState, setPageState] = useState<string | null>(null);
  const originalImageRef = useRef<HTMLImageElement>(null);
  const canvasOutputRef = useRef<HTMLCanvasElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

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

  return (
    <div>
      <div style={{ margin: 2 }}></div>
      <img
        ref={originalImageRef}
        alt="original file (should not be visible)"
        style={{ display: "none" }}
        src={pageState ?? defaultImage}
        onLoad={(ev) => {
          if (canvasOutputRef.current === null) {
            return;
          }

          const mat = window.cv.imread(ev.currentTarget);
          window.cv.imshow(canvasOutputRef.current, mat);
          mat.delete();
        }}
      />

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg"
        className="form-control"
        style={{ display: "none" }}
        onChange={(ev) => {
          const file = ev.target.files?.[0];

          if (file === undefined) {
            return;
          }

          const url = URL.createObjectURL(file);
          setPageState(url);
        }}
      />

      <div className="card-group m-1">
        <div className="card">
          <div className="card-body">
            <h5 className="card-title text-center">Original Image</h5>
            <img
              className="card-img p-2"
              alt="original"
              src={pageState ?? defaultImage}
            />
            <button
              className="btn btn-secondary"
              onClick={() => inputRef.current?.click()}
            >
              <FontAwesomeIcon icon={faImage} />
            </button>{" "}
          </div>
        </div>
        <div className="card">
          <div className="card-body">
            <h5 className="card-title text-center">Output Image</h5>
            <canvas ref={canvasOutputRef} className="card-img p-2"></canvas>
            <div>
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

                  const { coordinates2Index, index2Coordinates } =
                    createHandler(mat);

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
                <FontAwesomeIcon icon={faArrowsAltV} />
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

                  const { coordinates2Index, index2Coordinates } =
                    createHandler(mat);

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
                <FontAwesomeIcon icon={faArrowsAltH} />
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

                  range(mat.cols)
                    .flatMap((col) =>
                      range(mat.rows).map((row) => ({ row, col }))
                    )
                    .forEach(({ col, row }) => {
                      const ptr = mat.ucharPtr(row, col);

                      const [r, g, b, a] = [ptr[0], ptr[1], ptr[2], ptr[3]];
                      const result = 0.299 * r + 0.587 * g + 0.114 * b;
                      ptr.set([result, result, result, a]);
                    });

                  window.cv.imshow(canvasOutputRef.current, mat);
                  mat.delete();
                }}
              >
                <FontAwesomeIcon icon={faPalette} />
              </button>{" "}
              <button
                className="btn btn-success"
                onClick={async () => {
                  if (canvasOutputRef.current === null) {
                    return;
                  }

                  const imageDataURL =
                    canvasOutputRef.current.toDataURL("image/jpeg");

                  const downloadLink = document.createElement("a");
                  downloadLink.href = imageDataURL;
                  downloadLink.download = "canvas_image.jpg";

                  downloadLink.click();
                }}
              >
                <FontAwesomeIcon icon={faDownload} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
