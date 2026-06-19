import { useEffect, useMemo, useRef, useState } from "react";

const STORAGE_KEY = "daily-fan-log-records-tailwind-v2";

const categoryOptions = [
  { value: "stream", label: "스트리밍" },
  { value: "live", label: "라이브" },
  { value: "goods", label: "굿즈" },
  { value: "event", label: "이벤트" },
  { value: "photo", label: "포토" },
  { value: "note", label: "기록" },
];

const viewOptions = [
  { value: "calendar", label: "캘린더", icon: "calendar" },
  { value: "collection", label: "컬렉션", icon: "grid" },
  { value: "gallery", label: "갤러리", icon: "image" },
];

const emptyRecord = {
  id: "",
  date: "",
  title: "",
  category: "stream",
  memo: "",
  thumbnail: "",
  photos: [],
  youtubeUrl: "",
  createdAt: "",
  updatedAt: "",
};

const buttonBase =
  "inline-flex items-center justify-center gap-2 rounded-2xl font-black transition active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50";

const glassCard =
  "rounded-[2rem] border border-white/70 bg-white/85 shadow-[0_10px_30px_rgba(17,24,39,0.07)] backdrop-blur-xl";

const iconButton =
  "grid h-11 w-11 place-items-center rounded-2xl border border-slate-200 bg-white text-slate-950 transition hover:border-slate-300 hover:bg-slate-50";

const primaryButton =
  `${buttonBase} min-h-12 bg-slate-950 px-5 text-white shadow-[0_12px_24px_rgba(17,24,39,0.18)] hover:bg-slate-800`;

const secondaryButton =
  `${buttonBase} min-h-12 bg-slate-100 px-5 text-slate-700 hover:bg-slate-200`;

function Icon({ name, size = 20 }) {
  const icons = {
    search: (
      <>
        <circle cx="11" cy="11" r="7" />
        <path d="M20 20L16.5 16.5" />
      </>
    ),
    plus: (
      <>
        <path d="M12 5V19" />
        <path d="M5 12H19" />
      </>
    ),
    calendar: (
      <>
        <path d="M7 3V6" />
        <path d="M17 3V6" />
        <path d="M4 8H20" />
        <rect x="4" y="5" width="16" height="16" rx="4" />
      </>
    ),
    grid: (
      <>
        <rect x="4" y="4" width="6" height="6" rx="2" />
        <rect x="14" y="4" width="6" height="6" rx="2" />
        <rect x="4" y="14" width="6" height="6" rx="2" />
        <rect x="14" y="14" width="6" height="6" rx="2" />
      </>
    ),
    image: (
      <>
        <rect x="4" y="5" width="16" height="14" rx="4" />
        <path d="M8 14L10.4 11.6C11.1 10.9 12.2 10.9 12.9 11.6L16 14.7" />
        <path d="M14.5 12.5L15.2 11.8C15.9 11.1 17 11.1 17.7 11.8L20 14.1" />
        <circle cx="9" cy="9" r="1.2" />
      </>
    ),
    more: (
      <>
        <circle cx="6" cy="12" r="1.4" />
        <circle cx="12" cy="12" r="1.4" />
        <circle cx="18" cy="12" r="1.4" />
      </>
    ),
    close: (
      <>
        <path d="M6 6L18 18" />
        <path d="M18 6L6 18" />
      </>
    ),
    edit: (
      <>
        <path d="M13 5L19 11" />
        <path d="M5 19L7 13L16 4C17.1 2.9 18.9 2.9 20 4C21.1 5.1 21.1 6.9 20 8L11 17L5 19Z" />
      </>
    ),
    trash: (
      <>
        <path d="M4 7H20" />
        <path d="M10 11V17" />
        <path d="M14 11V17" />
        <path d="M6 7L7 21H17L18 7" />
        <path d="M9 7V4H15V7" />
      </>
    ),
    left: <path d="M15 18L9 12L15 6" />,
    right: <path d="M9 18L15 12L9 6" />,
    play: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M10 8.8L16 12L10 15.2V8.8Z" />
      </>
    ),
    star: (
      <path d="M12 3.5L14.7 9L20.7 9.9L16.4 14.1L17.4 20L12 17.2L6.6 20L7.6 14.1L3.3 9.9L9.3 9L12 3.5Z" />
    ),
    rotate: (
      <>
        <path d="M20 11A8 8 0 1 1 17.7 5.4" />
        <path d="M20 4V11H13" />
      </>
    ),
  };

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {icons[name]}
    </svg>
  );
}

function pad2(value) {
  return String(value).padStart(2, "0");
}

function createId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function toDateKey(date) {
  return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`;
}

function getMonthTitle(date) {
  return `${date.getFullYear()}년 ${date.getMonth() + 1}월`;
}

function getReadableDate(dateKey) {
  const date = new Date(`${dateKey}T00:00:00`);
  const weekdays = ["일", "월", "화", "수", "목", "금", "토"];

  return `${date.getFullYear()}.${pad2(date.getMonth() + 1)}.${pad2(date.getDate())} ${weekdays[date.getDay()]}요일`;
}

function getDaysInMonth(year, monthIndex) {
  return new Date(year, monthIndex + 1, 0).getDate();
}

function getCalendarCells(currentMonth) {
  const year = currentMonth.getFullYear();
  const monthIndex = currentMonth.getMonth();
  const firstDay = new Date(year, monthIndex, 1);
  const firstWeekday = firstDay.getDay();
  const daysInMonth = getDaysInMonth(year, monthIndex);
  const prevMonthDays = getDaysInMonth(year, monthIndex - 1);
  const cells = [];

  for (let i = firstWeekday - 1; i >= 0; i -= 1) {
    const day = prevMonthDays - i;
    const date = new Date(year, monthIndex - 1, day);

    cells.push({
      date,
      dateKey: toDateKey(date),
      day,
      isCurrentMonth: false,
    });
  }

  for (let day = 1; day <= daysInMonth; day += 1) {
    const date = new Date(year, monthIndex, day);

    cells.push({
      date,
      dateKey: toDateKey(date),
      day,
      isCurrentMonth: true,
    });
  }

  while (cells.length % 7 !== 0) {
    const lastDate = new Date(cells[cells.length - 1].date);
    lastDate.setDate(lastDate.getDate() + 1);

    cells.push({
      date: lastDate,
      dateKey: toDateKey(lastDate),
      day: lastDate.getDate(),
      isCurrentMonth: false,
    });
  }

  while (cells.length < 42) {
    const lastDate = new Date(cells[cells.length - 1].date);
    lastDate.setDate(lastDate.getDate() + 1);

    cells.push({
      date: lastDate,
      dateKey: toDateKey(lastDate),
      day: lastDate.getDate(),
      isCurrentMonth: false,
    });
  }

  return cells;
}

function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

async function filesToDataUrls(fileList) {
  const files = Array.from(fileList || []);
  return Promise.all(files.map((file) => readFileAsDataUrl(file)));
}

function drawEditedImageToCanvas(canvas, src, settings, outputWidth, outputHeight) {
  return new Promise((resolve, reject) => {
    const image = new Image();

    image.onload = () => {
      const context = canvas.getContext("2d");

      canvas.width = outputWidth;
      canvas.height = outputHeight;

      context.clearRect(0, 0, outputWidth, outputHeight);
      context.fillStyle = "#ffffff";
      context.fillRect(0, 0, outputWidth, outputHeight);
      context.imageSmoothingEnabled = true;
      context.imageSmoothingQuality = "high";

      const angle = ((settings.rotate % 360) + 360) % 360;
      const radians = (angle * Math.PI) / 180;
      const isQuarterTurn = angle === 90 || angle === 270;

      const rotatedWidth = isQuarterTurn ? image.height : image.width;
      const rotatedHeight = isQuarterTurn ? image.width : image.height;

      const baseScale = Math.max(outputWidth / rotatedWidth, outputHeight / rotatedHeight);
      const scale = baseScale * settings.zoom;

      const scaledRotatedWidth = rotatedWidth * scale;
      const scaledRotatedHeight = rotatedHeight * scale;

      const maxOffsetX = Math.max(0, (scaledRotatedWidth - outputWidth) / 2);
      const maxOffsetY = Math.max(0, (scaledRotatedHeight - outputHeight) / 2);

      const offsetX = ((50 - settings.positionX) / 50) * maxOffsetX;
      const offsetY = ((50 - settings.positionY) / 50) * maxOffsetY;

      context.save();
      context.translate(outputWidth / 2 + offsetX, outputHeight / 2 + offsetY);
      context.rotate(radians);
      context.drawImage(
        image,
        -(image.width * scale) / 2,
        -(image.height * scale) / 2,
        image.width * scale,
        image.height * scale
      );
      context.restore();

      resolve();
    };

    image.onerror = reject;
    image.src = src;
  });
}

async function createEditedImage(src, settings) {
  const canvas = document.createElement("canvas");

  await drawEditedImageToCanvas(canvas, src, settings, 1080, 1920);

  return canvas.toDataURL("image/jpeg", 0.92);
}

function extractYoutubeId(url) {
  if (!url) return "";

  const trimmed = url.trim();

  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) {
    return trimmed;
  }

  try {
    const parsed = new URL(trimmed);

    if (parsed.hostname.includes("youtu.be")) {
      return parsed.pathname.replace("/", "").slice(0, 11);
    }

    if (parsed.hostname.includes("youtube.com")) {
      if (parsed.pathname.startsWith("/watch")) {
        return parsed.searchParams.get("v") || "";
      }

      if (parsed.pathname.startsWith("/shorts/")) {
        return parsed.pathname.split("/shorts/")[1]?.split("/")[0] || "";
      }

      if (parsed.pathname.startsWith("/embed/")) {
        return parsed.pathname.split("/embed/")[1]?.split("/")[0] || "";
      }
    }
  } catch {
    return "";
  }

  return "";
}

function getCategoryLabel(value) {
  return categoryOptions.find((category) => category.value === value)?.label || "기록";
}

function getCategoryPillClass(category) {
  const base =
    "inline-flex min-h-8 items-center gap-1.5 rounded-full px-3 text-xs font-black";

  const styles = {
    stream: "bg-indigo-50 text-indigo-600",
    live: "bg-rose-50 text-rose-600",
    goods: "bg-emerald-50 text-emerald-600",
    event: "bg-orange-50 text-orange-600",
    photo: "bg-fuchsia-50 text-fuchsia-600",
    note: "bg-slate-100 text-slate-600",
  };

  return `${base} ${styles[category] || styles.note}`;
}

function EmptyBlock({ icon = "calendar", title, description, actionLabel, onAction }) {
  return (
    <div className="grid min-h-[260px] place-items-center rounded-[1.75rem] border border-dashed border-slate-300 bg-slate-50/70 px-6 py-10 text-center text-slate-400">
      <div className="grid place-items-center">
        <Icon name={icon} size={34} />
        <strong className="mt-4 block text-xl font-black text-slate-950">{title}</strong>
        <p className="mt-2 max-w-sm text-sm font-bold leading-6 text-slate-500">
          {description}
        </p>
        {actionLabel && (
          <button type="button" className={`${primaryButton} mt-5`} onClick={onAction}>
            {actionLabel}
          </button>
        )}
      </div>
    </div>
  );
}

function ImageEditorOverlay({ image, title, onSave, onClose }) {
  const previewCanvasRef = useRef(null);

  const [settings, setSettings] = useState({
    rotate: 0,
    zoom: 1,
    positionX: 50,
    positionY: 50,
  });

  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const canvas = previewCanvasRef.current;

    if (!canvas) return;

    drawEditedImageToCanvas(canvas, image.src, settings, 540, 960).catch(() => {});
  }, [image.src, settings]);

  const updateSetting = (key, value) => {
    setSettings((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const rotateLeft = () => {
    setSettings((prev) => ({
      ...prev,
      rotate: prev.rotate - 90,
    }));
  };

  const rotateRight = () => {
    setSettings((prev) => ({
      ...prev,
      rotate: prev.rotate + 90,
    }));
  };

  const resetEdit = () => {
    setSettings({
      rotate: 0,
      zoom: 1,
      positionX: 50,
      positionY: 50,
    });
  };

  const handleSave = async () => {
    setIsSaving(true);

    try {
      const editedImage = await createEditedImage(image.src, settings);
      onSave(editedImage);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[70] flex items-end justify-center bg-slate-950/55 p-0 backdrop-blur-md md:items-center md:p-6"
      onMouseDown={(event) => {
        event.stopPropagation();

        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <section
        className="max-h-[94vh] w-full overflow-auto rounded-t-[2rem] bg-white shadow-[0_24px_70px_rgba(17,24,39,0.3)] md:max-w-3xl md:rounded-[2rem]"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <header className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-slate-200 bg-white/90 p-5 backdrop-blur-xl">
          <div>
            <p className="text-xs font-black text-slate-400">Image Editor</p>
            <h2 className="mt-1 text-2xl font-black text-slate-950">{title}</h2>
            <p className="mt-1 text-sm font-bold text-slate-500">
              캘린더 썸네일에 맞춰 9:16 세로 비율로 저장됩니다.
            </p>
          </div>

          <button type="button" className={iconButton} onClick={onClose} aria-label="닫기">
            <Icon name="close" />
          </button>
        </header>

        <div className="grid gap-5 p-5 md:grid-cols-[minmax(0,1fr)_260px]">
          <div className="grid place-items-center rounded-[1.75rem] bg-slate-100 p-4">
            <div className="relative aspect-[9/16] h-[min(62vh,620px)] max-h-[620px] w-auto overflow-hidden rounded-[1.5rem] bg-slate-950 shadow-[0_18px_50px_rgba(17,24,39,0.18)]">
              <canvas
                ref={previewCanvasRef}
                className="block h-full w-full"
                aria-label="이미지 편집 미리보기"
              />

              <div className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-white/30" />
              <div className="pointer-events-none absolute left-1/3 top-0 h-full w-px bg-white/15" />
              <div className="pointer-events-none absolute left-2/3 top-0 h-full w-px bg-white/15" />
              <div className="pointer-events-none absolute left-0 top-1/3 h-px w-full bg-white/15" />
              <div className="pointer-events-none absolute left-0 top-2/3 h-px w-full bg-white/15" />
            </div>
          </div>

          <div className="grid content-start gap-4">
            <div className="rounded-3xl border border-slate-200 bg-white p-4">
              <p className="text-sm font-black text-slate-950">회전</p>
              <div className="mt-3 grid grid-cols-2 gap-2">
                <button type="button" className={secondaryButton} onClick={rotateLeft}>
                  <Icon name="rotate" size={17} />
                  왼쪽
                </button>

                <button type="button" className={secondaryButton} onClick={rotateRight}>
                  <Icon name="rotate" size={17} />
                  오른쪽
                </button>
              </div>
            </div>

            <label className="grid gap-2 rounded-3xl border border-slate-200 bg-white p-4 text-sm font-black text-slate-950">
              확대
              <input
                type="range"
                min="1"
                max="3"
                step="0.05"
                value={settings.zoom}
                onChange={(event) => updateSetting("zoom", Number(event.target.value))}
                className="accent-slate-950"
              />
              <span className="text-xs font-bold text-slate-400">
                {Math.round(settings.zoom * 100)}%
              </span>
            </label>

            <label className="grid gap-2 rounded-3xl border border-slate-200 bg-white p-4 text-sm font-black text-slate-950">
              가로 위치
              <input
                type="range"
                min="0"
                max="100"
                step="1"
                value={settings.positionX}
                onChange={(event) => updateSetting("positionX", Number(event.target.value))}
                className="accent-slate-950"
              />
            </label>

            <label className="grid gap-2 rounded-3xl border border-slate-200 bg-white p-4 text-sm font-black text-slate-950">
              세로 위치
              <input
                type="range"
                min="0"
                max="100"
                step="1"
                value={settings.positionY}
                onChange={(event) => updateSetting("positionY", Number(event.target.value))}
                className="accent-slate-950"
              />
            </label>

            <button
              type="button"
              className="min-h-11 rounded-2xl bg-slate-100 px-4 text-sm font-black text-slate-700 hover:bg-slate-200"
              onClick={resetEdit}
            >
              초기화
            </button>

            <div className="grid grid-cols-2 gap-2 pt-1">
              <button type="button" className={secondaryButton} onClick={onClose}>
                취소
              </button>

              <button
                type="button"
                className={primaryButton}
                onClick={handleSave}
                disabled={isSaving}
              >
                {isSaving ? "저장 중" : "적용"}
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function RecordOverlay({
  mode,
  record,
  selectedDate,
  onClose,
  onSave,
  onDelete,
  onRequestEdit,
}) {
  const [form, setForm] = useState(() => {
    if (record) return { ...emptyRecord, ...record };

    return {
      ...emptyRecord,
      id: createId(),
      date: selectedDate,
      createdAt: new Date().toISOString(),
    };
  });

  const [menuOpen, setMenuOpen] = useState(false);
  const [imageEditor, setImageEditor] = useState(null);
  const [photoQueue, setPhotoQueue] = useState([]);

  const youtubeId = extractYoutubeId(form.youtubeUrl);
  const isViewMode = mode === "view";

  useEffect(() => {
    if (record) {
      setForm({ ...emptyRecord, ...record });
      return;
    }

    setForm({
      ...emptyRecord,
      id: createId(),
      date: selectedDate,
      createdAt: new Date().toISOString(),
    });
  }, [record, selectedDate]);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleThumbnailChange = async (event) => {
    const [dataUrl] = await filesToDataUrls(event.target.files);
    event.target.value = "";

    if (!dataUrl) return;

    setImageEditor({
      type: "thumbnail",
      src: dataUrl,
    });
  };

  const handlePhotosChange = async (event) => {
    const urls = await filesToDataUrls(event.target.files);
    event.target.value = "";

    if (urls.length === 0) return;

    setPhotoQueue(urls.slice(1));
    setImageEditor({
      type: "photo",
      src: urls[0],
    });
  };

  const handleImageEditorSave = (editedImage) => {
    if (!imageEditor) return;

    if (imageEditor.type === "thumbnail") {
      setForm((prev) => ({
        ...prev,
        thumbnail: editedImage,
      }));

      setImageEditor(null);
      return;
    }

    if (imageEditor.type === "photo") {
      setForm((prev) => ({
        ...prev,
        photos: [...prev.photos, editedImage],
      }));

      if (photoQueue.length > 0) {
        const [nextPhoto, ...restPhotos] = photoQueue;

        setPhotoQueue(restPhotos);
        setImageEditor({
          type: "photo",
          src: nextPhoto,
        });
      } else {
        setImageEditor(null);
      }

      return;
    }

    if (imageEditor.type === "replacePhoto") {
      setForm((prev) => ({
        ...prev,
        photos: prev.photos.map((photo, index) =>
          index === imageEditor.index ? editedImage : photo
        ),
      }));

      setImageEditor(null);
    }
  };

  const closeImageEditor = () => {
    setImageEditor(null);
    setPhotoQueue([]);
  };

  const removePhoto = (targetIndex) => {
    setForm((prev) => ({
      ...prev,
      photos: prev.photos.filter((_, index) => index !== targetIndex),
    }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    const nextRecord = {
      ...form,
      title: form.title.trim() || "제목 없음",
      memo: form.memo.trim(),
      youtubeUrl: form.youtubeUrl.trim(),
      updatedAt: new Date().toISOString(),
    };

    onSave(nextRecord);
  };

  if (isViewMode && record) {
    return (
      <div
        className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/45 p-0 backdrop-blur-md md:items-center md:p-6"
        onMouseDown={onClose}
      >
        <article
          className="max-h-[92vh] w-full overflow-auto rounded-t-[2rem] border border-white/60 bg-white shadow-[0_24px_70px_rgba(17,24,39,0.22)] md:max-w-2xl md:rounded-[2rem]"
          onMouseDown={(event) => event.stopPropagation()}
        >
          <header className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-slate-200 bg-white/90 p-5 backdrop-blur-xl md:p-6">
            <div className="min-w-0">
              <p className="text-sm font-black text-slate-400">{getReadableDate(record.date)}</p>
              <h2 className="mt-1 truncate text-2xl font-black leading-tight text-slate-950">
                {record.title}
              </h2>
            </div>

            <div className="relative flex shrink-0 gap-2">
              <button
                type="button"
                className={iconButton}
                onClick={() => setMenuOpen((prev) => !prev)}
                aria-label="메뉴 열기"
              >
                <Icon name="more" />
              </button>

              {menuOpen && (
                <div className="absolute right-12 top-12 z-20 w-40 rounded-2xl border border-slate-200 bg-white p-2 shadow-[0_18px_48px_rgba(15,23,42,0.16)]">
                  <button
                    type="button"
                    className="flex min-h-11 w-full items-center gap-2 rounded-xl px-3 text-left text-sm font-black text-slate-800 hover:bg-slate-100"
                    onClick={() => {
                      setMenuOpen(false);
                      onRequestEdit();
                    }}
                  >
                    <Icon name="edit" size={17} />
                    수정하기
                  </button>

                  <button
                    type="button"
                    className="flex min-h-11 w-full items-center gap-2 rounded-xl px-3 text-left text-sm font-black text-red-500 hover:bg-red-50"
                    onClick={() => onDelete(record.id)}
                  >
                    <Icon name="trash" size={17} />
                    삭제하기
                  </button>
                </div>
              )}

              <button type="button" className={iconButton} onClick={onClose} aria-label="닫기">
                <Icon name="close" />
              </button>
            </div>
          </header>

          <div className="p-5 md:p-6">
            {record.thumbnail ? (
              <img
                className="mx-auto aspect-[9/16] max-h-[620px] w-auto rounded-[1.65rem] bg-slate-100 object-cover"
                src={record.thumbnail}
                alt="대표 이미지"
              />
            ) : (
              <div className="grid min-h-60 place-items-center rounded-[1.65rem] bg-gradient-to-br from-slate-50 to-indigo-50 text-sm font-black text-slate-400">
                <div className="grid place-items-center">
                  <Icon name="image" size={30} />
                  <span className="mt-2">대표 이미지 없음</span>
                </div>
              </div>
            )}

            <div className="mt-5 flex flex-wrap gap-2">
              <span className={getCategoryPillClass(record.category)}>
                {getCategoryLabel(record.category)}
              </span>

              {youtubeId && (
                <span className="inline-flex min-h-8 items-center gap-1.5 rounded-full bg-red-50 px-3 text-xs font-black text-red-600">
                  <Icon name="play" size={15} />
                  YouTube
                </span>
              )}
            </div>

            {record.memo ? (
              <p className="mt-5 whitespace-pre-wrap text-[15px] font-semibold leading-8 text-slate-700">
                {record.memo}
              </p>
            ) : (
              <p className="mt-5 text-sm font-black text-slate-400">
                아직 작성된 기록이 없습니다.
              </p>
            )}

            {record.photos?.length > 0 && (
              <section className="mt-8">
                <h3 className="mb-3 text-base font-black text-slate-950">사진</h3>
                <div className="grid grid-cols-2 gap-3">
                  {record.photos.map((photo, index) => (
                    <img
                      key={`${photo}-${index}`}
                      className="aspect-[9/16] w-full rounded-3xl bg-slate-100 object-cover"
                      src={photo}
                      alt={`첨부 사진 ${index + 1}`}
                    />
                  ))}
                </div>
              </section>
            )}

            {youtubeId && (
              <section className="mt-8">
                <h3 className="mb-3 text-base font-black text-slate-950">YouTube</h3>
                <div className="aspect-video w-full overflow-hidden rounded-3xl bg-black">
                  <iframe
                    className="h-full w-full border-0"
                    src={`https://www.youtube.com/embed/${youtubeId}`}
                    title="YouTube video player"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                  />
                </div>
              </section>
            )}
          </div>
        </article>
      </div>
    );
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/45 p-0 backdrop-blur-md md:items-center md:p-6"
      onMouseDown={onClose}
    >
      <article
        className="max-h-[92vh] w-full overflow-auto rounded-t-[2rem] border border-white/60 bg-white shadow-[0_24px_70px_rgba(17,24,39,0.22)] md:max-w-2xl md:rounded-[2rem]"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <header className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-slate-200 bg-white/90 p-5 backdrop-blur-xl md:p-6">
          <div>
            <p className="text-sm font-black text-slate-400">{getReadableDate(form.date)}</p>
            <h2 className="mt-1 text-2xl font-black leading-tight text-slate-950">
              {record ? "게시물 수정" : "새 게시물 추가"}
            </h2>
          </div>

          <button type="button" className={iconButton} onClick={onClose} aria-label="닫기">
            <Icon name="close" />
          </button>
        </header>

        <form className="grid gap-4 p-5 md:p-6" onSubmit={handleSubmit}>
          <div className="grid gap-4 md:grid-cols-2">
            <label className="grid gap-2 text-sm font-black text-slate-700">
              날짜
              <input
                className="h-12 rounded-2xl border border-slate-200 bg-white px-4 font-bold text-slate-950 outline-none transition focus:border-slate-950 focus:ring-4 focus:ring-slate-950/5"
                type="date"
                name="date"
                value={form.date}
                onChange={handleChange}
              />
            </label>

            <label className="grid gap-2 text-sm font-black text-slate-700">
              카테고리
              <select
                className="h-12 rounded-2xl border border-slate-200 bg-white px-4 font-bold text-slate-950 outline-none transition focus:border-slate-950 focus:ring-4 focus:ring-slate-950/5"
                name="category"
                value={form.category}
                onChange={handleChange}
              >
                {categoryOptions.map((category) => (
                  <option key={category.value} value={category.value}>
                    {category.label}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <label className="grid gap-2 text-sm font-black text-slate-700">
            제목
            <input
              className="h-12 rounded-2xl border border-slate-200 bg-white px-4 font-bold text-slate-950 outline-none transition placeholder:text-slate-300 focus:border-slate-950 focus:ring-4 focus:ring-slate-950/5"
              type="text"
              name="title"
              value={form.title}
              onChange={handleChange}
              placeholder="예: 새 영상 업로드, 라이브 본 날"
            />
          </label>

          <label className="grid gap-2 text-sm font-black text-slate-700">
            대표 이미지
            <input
              className="rounded-2xl border border-slate-200 bg-white p-3 text-sm font-bold text-slate-500 file:mr-3 file:rounded-xl file:border-0 file:bg-slate-950 file:px-4 file:py-2 file:text-sm file:font-black file:text-white"
              type="file"
              accept="image/*"
              onChange={handleThumbnailChange}
            />
          </label>

          {form.thumbnail && (
            <div className="grid gap-3">
              <img
                className="mx-auto aspect-[9/16] max-h-[520px] w-auto rounded-3xl bg-slate-100 object-cover"
                src={form.thumbnail}
                alt="대표 이미지 미리보기"
              />

              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  className="rounded-2xl bg-slate-100 px-4 py-2 text-sm font-black text-slate-700 hover:bg-slate-200"
                  onClick={() =>
                    setImageEditor({
                      type: "thumbnail",
                      src: form.thumbnail,
                    })
                  }
                >
                  이미지 편집
                </button>

                <button
                  type="button"
                  className="rounded-2xl bg-red-50 px-4 py-2 text-sm font-black text-red-500 hover:bg-red-100"
                  onClick={() =>
                    setForm((prev) => ({
                      ...prev,
                      thumbnail: "",
                    }))
                  }
                >
                  대표 이미지 제거
                </button>
              </div>
            </div>
          )}

          <label className="grid gap-2 text-sm font-black text-slate-700">
            기록
            <textarea
              className="min-h-44 resize-y rounded-2xl border border-slate-200 bg-white px-4 py-3 font-semibold leading-7 text-slate-950 outline-none transition placeholder:text-slate-300 focus:border-slate-950 focus:ring-4 focus:ring-slate-950/5"
              name="memo"
              value={form.memo}
              onChange={handleChange}
              placeholder="오늘의 감상, 기억하고 싶은 장면, 링크와 함께 남기고 싶은 내용을 적어주세요."
              rows={8}
            />
          </label>

          <label className="grid gap-2 text-sm font-black text-slate-700">
            사진 첨부
            <input
              className="rounded-2xl border border-slate-200 bg-white p-3 text-sm font-bold text-slate-500 file:mr-3 file:rounded-xl file:border-0 file:bg-slate-950 file:px-4 file:py-2 file:text-sm file:font-black file:text-white"
              type="file"
              accept="image/*"
              multiple
              onChange={handlePhotosChange}
            />
          </label>

          {form.photos.length > 0 && (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
              {form.photos.map((photo, index) => (
                <div className="relative" key={`${photo}-${index}`}>
                  <img
                    className="aspect-[9/16] w-full rounded-3xl bg-slate-100 object-cover"
                    src={photo}
                    alt={`첨부 사진 ${index + 1}`}
                  />

                  <div className="absolute bottom-2 right-2 flex gap-1">
                    <button
                      type="button"
                      className="rounded-full bg-white/90 px-3 py-1.5 text-xs font-black text-slate-950 backdrop-blur"
                      onClick={() =>
                        setImageEditor({
                          type: "replacePhoto",
                          src: photo,
                          index,
                        })
                      }
                    >
                      편집
                    </button>

                    <button
                      type="button"
                      className="rounded-full bg-slate-950/85 px-3 py-1.5 text-xs font-black text-white"
                      onClick={() => removePhoto(index)}
                    >
                      삭제
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          <label className="grid gap-2 text-sm font-black text-slate-700">
            YouTube URL 또는 영상 ID
            <input
              className="h-12 rounded-2xl border border-slate-200 bg-white px-4 font-bold text-slate-950 outline-none transition placeholder:text-slate-300 focus:border-slate-950 focus:ring-4 focus:ring-slate-950/5"
              type="text"
              name="youtubeUrl"
              value={form.youtubeUrl}
              onChange={handleChange}
              placeholder="https://www.youtube.com/watch?v=..."
            />
          </label>

          {youtubeId && (
            <div className="aspect-video w-full overflow-hidden rounded-3xl bg-black">
              <iframe
                className="h-full w-full border-0"
                src={`https://www.youtube.com/embed/${youtubeId}`}
                title="YouTube video preview"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
            </div>
          )}

          <footer className="sticky bottom-[-20px] -mx-5 -mb-5 mt-2 flex gap-3 border-t border-slate-200 bg-white/90 p-5 backdrop-blur-xl md:-mx-6 md:-mb-6 md:px-6">
            <button type="button" className={`${secondaryButton} flex-1`} onClick={onClose}>
              취소
            </button>
            <button type="submit" className={`${primaryButton} flex-1`}>
              저장하기
            </button>
          </footer>
        </form>
      </article>

      {imageEditor && (
        <ImageEditorOverlay
          image={imageEditor}
          title={imageEditor.type === "thumbnail" ? "대표 이미지 편집" : "사진 편집"}
          onSave={handleImageEditorSave}
          onClose={closeImageEditor}
        />
      )}
    </div>
  );
}

function DayPostsSheet({ date, records, onClose, onOpenRecord, onCreate }) {
  return (
    <div
      className="fixed inset-0 z-40 flex items-end justify-center bg-slate-950/35 p-0 backdrop-blur-sm"
      onMouseDown={onClose}
    >
      <section
        className="w-full max-w-2xl rounded-t-[2rem] bg-white p-5 shadow-[0_-20px_60px_rgba(17,24,39,0.18)] md:mb-6 md:rounded-[2rem]"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-slate-200 md:hidden" />

        <header className="mb-4 flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-black text-slate-400">Posts</p>
            <h2 className="mt-1 text-2xl font-black text-slate-950">
              {getReadableDate(date)}
            </h2>
            <p className="mt-1 text-sm font-bold text-slate-500">
              이 날짜에 등록된 게시물 {records.length}개
            </p>
          </div>

          <button type="button" className={iconButton} onClick={onClose} aria-label="닫기">
            <Icon name="close" />
          </button>
        </header>

        <div className="grid max-h-[58vh] gap-3 overflow-auto">
          {records.map((record) => (
            <button
              type="button"
              key={record.id}
              className="grid w-full grid-cols-[74px_minmax(0,1fr)] items-center gap-3 rounded-3xl border border-slate-200 bg-white p-2.5 text-left transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-[0_10px_26px_rgba(17,24,39,0.08)]"
              onClick={() => onOpenRecord(record.id)}
            >
              {record.thumbnail ? (
                <img
                  className="aspect-[9/16] h-[96px] w-[54px] justify-self-center rounded-2xl object-cover"
                  src={record.thumbnail}
                  alt={record.title}
                />
              ) : (
                <div className="grid aspect-[9/16] h-[96px] w-[54px] place-items-center justify-self-center rounded-2xl bg-slate-100 text-slate-400">
                  <Icon name="image" size={18} />
                </div>
              )}

              <div className="min-w-0">
                <span className={getCategoryPillClass(record.category)}>
                  {getCategoryLabel(record.category)}
                </span>
                <strong className="mt-2 block truncate text-base font-black text-slate-950">
                  {record.title}
                </strong>
                <p className="mt-1 line-clamp-2 text-sm font-bold leading-6 text-slate-500">
                  {record.memo || "작성된 기록 내용이 없습니다."}
                </p>
              </div>
            </button>
          ))}
        </div>

        <button
          type="button"
          className={`${primaryButton} mt-4 w-full`}
          onClick={() => onCreate(date)}
        >
          <Icon name="plus" size={18} />
          이 날짜에 게시물 추가
        </button>
      </section>
    </div>
  );
}

function FilterChips({ categoryFilter, setCategoryFilter, records }) {
  return (
    <div className="mb-5 flex flex-wrap gap-2">
      <button
        type="button"
        className={`inline-flex min-h-10 items-center gap-2 rounded-full border px-4 text-sm font-black transition ${
          categoryFilter === "all"
            ? "border-slate-950 bg-slate-950 text-white"
            : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
        }`}
        onClick={() => setCategoryFilter("all")}
      >
        전체 <span className="opacity-70">{records.length}</span>
      </button>

      {categoryOptions.map((category) => (
        <button
          type="button"
          key={category.value}
          className={`inline-flex min-h-10 items-center gap-2 rounded-full border px-4 text-sm font-black transition ${
            categoryFilter === category.value
              ? "border-slate-950 bg-slate-950 text-white"
              : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
          }`}
          onClick={() => setCategoryFilter(category.value)}
        >
          {category.label}
          <span className="opacity-70">
            {records.filter((record) => record.category === category.value).length}
          </span>
        </button>
      ))}
    </div>
  );
}

function CalendarView({
  cells,
  recordsByDate,
  selectedDate,
  setSelectedDate,
  todayKey,
  currentMonth,
  records,
  monthRecordCount,
  photoCount,
  onMoveMonth,
  onToday,
  onCreate,
  onOpenRecord,
  onOpenDayPosts,
}) {
  const handleCellClick = (dateKey, dayRecords) => {
    setSelectedDate(dateKey);

    if (dayRecords.length === 1) {
      onOpenRecord(dayRecords[0].id);
      return;
    }

    if (dayRecords.length > 1) {
      onOpenDayPosts(dateKey, dayRecords);
    }
  };

  return (
    <section className={`${glassCard} p-3 sm:p-4 lg:p-6`}>
      <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="text-xs font-black text-slate-400">Calendar</p>
          <h2 className="mt-1 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
            {getMonthTitle(currentMonth)}
          </h2>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            className={iconButton}
            onClick={() => onMoveMonth(-1)}
            aria-label="이전 달"
          >
            <Icon name="left" size={19} />
          </button>

          <button
            type="button"
            className="h-11 flex-1 rounded-2xl border border-slate-200 bg-white px-5 text-sm font-black text-slate-700 transition hover:bg-slate-50 lg:flex-none"
            onClick={onToday}
          >
            오늘
          </button>

          <button
            type="button"
            className={iconButton}
            onClick={() => onMoveMonth(1)}
            aria-label="다음 달"
          >
            <Icon name="right" size={19} />
          </button>
        </div>
      </div>

      <div className="mb-5 grid grid-cols-3 gap-2">
        {[
          { label: "전체 게시물", value: records.length },
          { label: "이번 달", value: monthRecordCount },
          { label: "이미지", value: photoCount },
        ].map((item) => (
          <div
            key={item.label}
            className="rounded-3xl border border-slate-200 bg-gradient-to-b from-white to-slate-50 p-3 sm:p-4"
          >
            <span className="block text-xs font-black text-slate-400">{item.label}</span>
            <strong className="mt-2 block text-2xl font-black leading-none text-slate-950 sm:text-3xl">
              {item.value}
            </strong>
          </div>
        ))}
      </div>

      <div className="mb-2 grid grid-cols-7">
        {["일", "월", "화", "수", "목", "금", "토"].map((weekday) => (
          <span
            key={weekday}
            className="py-2 text-center text-xs font-black text-slate-400"
          >
            {weekday}
          </span>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1.5 sm:gap-2 lg:gap-3">
        {cells.map((cell) => {
          const dayRecords = recordsByDate[cell.dateKey] || [];
          const firstRecord = dayRecords[0];
          const isSelected = selectedDate === cell.dateKey;
          const isToday = todayKey === cell.dateKey;
          const hasRecords = dayRecords.length > 0;
          const visibleRecords = dayRecords.slice(0, 3);
          const extraCount = Math.max(0, dayRecords.length - 3);

          return (
            <div
              key={cell.dateKey}
              className={`group relative min-w-0 ${cell.isCurrentMonth ? "" : "opacity-35"}`}
            >
              <div
                role="button"
                tabIndex={0}
                className={[
                  "relative aspect-[9/16] w-full rounded-2xl border transition",
                  "hover:-translate-y-0.5 hover:shadow-[0_14px_34px_rgba(17,24,39,0.12)]",
                  hasRecords ? "bg-slate-950" : "bg-white/80",
                  isSelected
                    ? "border-slate-950 shadow-[inset_0_0_0_1px_#111827]"
                    : "border-slate-200 hover:border-slate-300",
                ].join(" ")}
                onClick={() => handleCellClick(cell.dateKey, dayRecords)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    handleCellClick(cell.dateKey, dayRecords);
                  }
                }}
              >
                {hasRecords ? (
                  <div className="absolute inset-0">
                    {visibleRecords.map((record, index) => {
                      const hasThumbnail = Boolean(record.thumbnail);

                      return (
                        <div
                          key={record.id}
                          className="absolute inset-0 overflow-hidden rounded-2xl border border-white/40 bg-slate-100 shadow-[0_10px_24px_rgba(15,23,42,0.18)]"
                          style={{
                            zIndex: 30 - index,
                            transform: `translate(${index * 5}px, ${index * 5}px) scale(${1 - index * 0.045})`,
                          }}
                        >
                          {hasThumbnail ? (
                            <img
                              className="h-full w-full object-cover"
                              src={record.thumbnail}
                              alt={record.title}
                            />
                          ) : (
                            <div className="grid h-full w-full place-items-center bg-gradient-to-br from-slate-100 to-indigo-50 p-2 text-center text-[10px] font-black text-slate-500">
                              {record.title}
                            </div>
                          )}

                          {index === 0 && (
                            <>
                              <div className="absolute inset-0 bg-gradient-to-b from-black/45 via-black/0 to-black/75" />
                              <div className="absolute inset-x-0 bottom-0 p-1.5 sm:p-2">
                                <div className="rounded-xl bg-black/35 p-1.5 text-white backdrop-blur-sm sm:p-2">
                                  <strong className="line-clamp-2 block text-[10px] font-black leading-tight sm:text-xs">
                                    {firstRecord.title}
                                  </strong>
                                </div>
                              </div>
                            </>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="absolute inset-0 rounded-2xl bg-white/80" />
                )}

                <div className="absolute left-1.5 top-1.5 z-40 flex items-center gap-1 sm:left-2 sm:top-2">
                  <span
                    className={[
                      "grid h-6 min-w-6 place-items-center rounded-full px-1 text-xs font-black",
                      isToday
                        ? "bg-slate-950 text-white"
                        : hasRecords
                          ? "bg-white/90 text-slate-950 shadow-sm backdrop-blur"
                          : "bg-slate-100 text-slate-700",
                    ].join(" ")}
                  >
                    {cell.day}
                  </span>

                  {isToday && (
                    <em
                      className={[
                        "hidden rounded-full px-2 py-1 text-[10px] font-black not-italic sm:block",
                        hasRecords
                          ? "bg-white/90 text-indigo-600 backdrop-blur"
                          : "bg-indigo-50 text-indigo-600",
                      ].join(" ")}
                    >
                      Today
                    </em>
                  )}
                </div>

                {dayRecords.length > 1 && (
                  <div className="absolute right-1.5 top-1.5 z-40 rounded-full bg-white/90 px-2 py-1 text-[10px] font-black text-slate-950 shadow-sm backdrop-blur sm:right-2 sm:top-2">
                    {dayRecords.length}개
                  </div>
                )}

                {extraCount > 0 && (
                  <div className="absolute bottom-2 right-2 z-40 rounded-full bg-slate-950/90 px-2 py-1 text-[10px] font-black text-white">
                    +{extraCount}
                  </div>
                )}

                {!hasRecords && (
                  <div className="absolute inset-x-0 bottom-3 hidden text-center text-[11px] font-black text-slate-300 lg:block">
                    No log
                  </div>
                )}
              </div>

              {cell.isCurrentMonth && (
                <button
                  type="button"
                  className={[
                    "absolute bottom-1.5 right-1.5 z-40 grid h-6 w-6 place-items-center rounded-xl text-white transition",
                    "lg:h-7 lg:w-7 lg:translate-y-1 lg:opacity-0 lg:group-hover:translate-y-0 lg:group-hover:opacity-100",
                    hasRecords
                      ? "bg-white/25 backdrop-blur hover:bg-white/35"
                      : "bg-slate-950/90 hover:bg-slate-800",
                  ].join(" ")}
                  onClick={(event) => {
                    event.stopPropagation();
                    onCreate(cell.dateKey);
                  }}
                  aria-label={`${cell.dateKey} 게시물 추가`}
                >
                  <Icon name="plus" size={14} />
                </button>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}

function CollectionView({
  records,
  filteredRecords,
  categoryFilter,
  setCategoryFilter,
  onOpenRecord,
  onCreate,
}) {
  const sortedRecords = [...filteredRecords].sort((a, b) => new Date(b.date) - new Date(a.date));

  return (
    <section className={`${glassCard} p-4 lg:p-6`}>
      <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="text-xs font-black text-slate-400">Collection</p>
          <h2 className="mt-1 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
            컬렉션
          </h2>
          <p className="mt-2 text-sm font-bold leading-6 text-slate-500">
            날짜별 게시물을 카드 형태로 모아볼 수 있습니다.
          </p>
        </div>

        <button type="button" className={`${primaryButton} hidden lg:inline-flex`} onClick={onCreate}>
          <Icon name="plus" size={18} />
          새 게시물
        </button>
      </div>

      <FilterChips
        categoryFilter={categoryFilter}
        setCategoryFilter={setCategoryFilter}
        records={records}
      />

      {sortedRecords.length > 0 ? (
        <div className="grid gap-4 xl:grid-cols-2">
          {sortedRecords.map((record) => (
            <button
              type="button"
              key={record.id}
              className="grid min-h-44 w-full gap-4 rounded-[1.75rem] border border-slate-200 bg-white p-3 text-left transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-[0_16px_42px_rgba(17,24,39,0.1)] sm:grid-cols-[120px_minmax(0,1fr)]"
              onClick={() => onOpenRecord(record.id)}
            >
              {record.thumbnail ? (
                <img
                  className="aspect-[9/16] h-60 w-full rounded-3xl object-cover sm:h-full"
                  src={record.thumbnail}
                  alt={record.title}
                />
              ) : (
                <div className="grid aspect-[9/16] h-60 w-full place-items-center rounded-3xl bg-slate-100 text-slate-400 sm:h-full">
                  <Icon name="image" size={26} />
                </div>
              )}

              <div className="min-w-0 py-1">
                <div className="mb-3 flex flex-wrap items-center gap-2">
                  <span className={getCategoryPillClass(record.category)}>
                    {getCategoryLabel(record.category)}
                  </span>
                  <em className="text-xs font-black not-italic text-slate-400">
                    {getReadableDate(record.date)}
                  </em>
                </div>

                <h3 className="truncate text-lg font-black text-slate-950">{record.title}</h3>

                <p className="mt-2 line-clamp-2 min-h-11 text-sm font-bold leading-6 text-slate-500">
                  {record.memo || "작성된 기록 내용이 없습니다."}
                </p>

                <div className="mt-4 flex flex-wrap gap-2">
                  <span className="inline-flex min-h-8 items-center gap-1.5 rounded-full bg-slate-100 px-3 text-xs font-black text-slate-500">
                    <Icon name="image" size={15} />
                    이미지 {(record.thumbnail ? 1 : 0) + record.photos.length}
                  </span>

                  {extractYoutubeId(record.youtubeUrl) && (
                    <span className="inline-flex min-h-8 items-center gap-1.5 rounded-full bg-red-50 px-3 text-xs font-black text-red-600">
                      <Icon name="play" size={15} />
                      YouTube
                    </span>
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>
      ) : (
        <EmptyBlock
          icon="grid"
          title="컬렉션이 비어 있습니다"
          description="게시물을 추가하면 이곳에서 카드 형태로 모아볼 수 있습니다."
          actionLabel="첫 게시물 추가"
          onAction={onCreate}
        />
      )}
    </section>
  );
}

function GalleryView({
  records,
  filteredRecords,
  categoryFilter,
  setCategoryFilter,
  onOpenRecord,
  onCreate,
}) {
  const galleryItems = filteredRecords.flatMap((record) => {
    const items = [];

    if (record.thumbnail) {
      items.push({
        id: `${record.id}-thumbnail`,
        recordId: record.id,
        src: record.thumbnail,
        title: record.title,
        date: record.date,
        type: "대표 이미지",
      });
    }

    record.photos.forEach((photo, index) => {
      items.push({
        id: `${record.id}-photo-${index}`,
        recordId: record.id,
        src: photo,
        title: record.title,
        date: record.date,
        type: `첨부 사진 ${index + 1}`,
      });
    });

    return items;
  });

  return (
    <section className={`${glassCard} p-4 lg:p-6`}>
      <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="text-xs font-black text-slate-400">Gallery</p>
          <h2 className="mt-1 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
            갤러리
          </h2>
          <p className="mt-2 text-sm font-bold leading-6 text-slate-500">
            대표 이미지와 첨부 사진을 이미지 중심으로 확인합니다.
          </p>
        </div>

        <button type="button" className={`${primaryButton} hidden lg:inline-flex`} onClick={onCreate}>
          <Icon name="plus" size={18} />
          새 게시물
        </button>
      </div>

      <FilterChips
        categoryFilter={categoryFilter}
        setCategoryFilter={setCategoryFilter}
        records={records}
      />

      {galleryItems.length > 0 ? (
        <div className="grid auto-rows-[260px] grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {galleryItems.map((item, index) => (
            <button
              type="button"
              key={item.id}
              className={`group relative overflow-hidden rounded-[1.75rem] bg-slate-100 text-left text-white ${
                index % 5 === 0 ? "sm:col-span-2 sm:row-span-2" : ""
              }`}
              onClick={() => onOpenRecord(item.recordId)}
            >
              <img
                className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                src={item.src}
                alt={item.title}
              />

              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-b from-transparent to-black/75 p-4">
                <span className="block text-xs font-black text-white/70">{item.type}</span>
                <strong className="mt-1 block truncate text-base font-black">{item.title}</strong>
                <em className="mt-1 block text-xs font-black not-italic text-white/70">
                  {getReadableDate(item.date)}
                </em>
              </div>
            </button>
          ))}
        </div>
      ) : (
        <EmptyBlock
          icon="image"
          title="갤러리가 비어 있습니다"
          description="대표 이미지나 사진을 첨부하면 이곳에 이미지가 모입니다."
          actionLabel="이미지 게시물 추가"
          onAction={onCreate}
        />
      )}
    </section>
  );
}

export default function App() {
  const todayKey = toDateKey(new Date());

  const [records, setRecords] = useState([]);
  const [activeView, setActiveView] = useState("calendar");
  const [currentMonth, setCurrentMonth] = useState(() => new Date());
  const [selectedDate, setSelectedDate] = useState(todayKey);
  const [selectedRecordId, setSelectedRecordId] = useState("");
  const [overlayMode, setOverlayMode] = useState(null);
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [query, setQuery] = useState("");
  const [dayPostsSheet, setDayPostsSheet] = useState(null);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);

    if (!saved) return;

    try {
      const parsed = JSON.parse(saved);
      setRecords(Array.isArray(parsed) ? parsed : []);
    } catch {
      setRecords([]);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
  }, [records]);

  const cells = useMemo(() => getCalendarCells(currentMonth), [currentMonth]);

  const filteredRecords = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return records.filter((record) => {
      const matchesCategory = categoryFilter === "all" || record.category === categoryFilter;
      const matchesQuery =
        !normalizedQuery ||
        record.title.toLowerCase().includes(normalizedQuery) ||
        record.memo.toLowerCase().includes(normalizedQuery);

      return matchesCategory && matchesQuery;
    });
  }, [records, categoryFilter, query]);

  const recordsByDate = useMemo(() => {
    return [...filteredRecords]
      .sort((a, b) => new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt))
      .reduce((acc, record) => {
        if (!acc[record.date]) acc[record.date] = [];
        acc[record.date].push(record);
        return acc;
      }, {});
  }, [filteredRecords]);

  const selectedDayRecords = useMemo(() => {
    return records
      .filter((record) => record.date === selectedDate)
      .sort((a, b) => new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt));
  }, [records, selectedDate]);

  const selectedRecord = useMemo(() => {
    return records.find((record) => record.id === selectedRecordId) || null;
  }, [records, selectedRecordId]);

  const monthRecordCount = useMemo(() => {
    return records.filter((record) => {
      const recordDate = new Date(`${record.date}T00:00:00`);

      return (
        recordDate.getFullYear() === currentMonth.getFullYear() &&
        recordDate.getMonth() === currentMonth.getMonth()
      );
    }).length;
  }, [records, currentMonth]);

  const photoCount = useMemo(() => {
    return records.reduce((total, record) => {
      return total + (record.thumbnail ? 1 : 0) + record.photos.length;
    }, 0);
  }, [records]);

  const youtubeCount = useMemo(() => {
    return records.filter((record) => extractYoutubeId(record.youtubeUrl)).length;
  }, [records]);

  const openCreateOverlay = (dateKey = selectedDate) => {
    setDayPostsSheet(null);
    setSelectedDate(dateKey);
    setSelectedRecordId("");
    setOverlayMode("edit");
  };

  const openViewOverlay = (recordId) => {
    const record = records.find((item) => item.id === recordId);

    setDayPostsSheet(null);

    if (record) {
      setSelectedDate(record.date);
    }

    setSelectedRecordId(recordId);
    setOverlayMode("view");
  };

  const openDayPosts = (dateKey, dayRecords) => {
    setSelectedDate(dateKey);
    setDayPostsSheet({
      date: dateKey,
      records: dayRecords,
    });
  };

  const closeOverlay = () => {
    setOverlayMode(null);
    setSelectedRecordId("");
  };

  const saveRecord = (nextRecord) => {
    setRecords((prev) => {
      const exists = prev.some((record) => record.id === nextRecord.id);

      if (exists) {
        return prev.map((record) => (record.id === nextRecord.id ? nextRecord : record));
      }

      return [...prev, nextRecord];
    });

    setSelectedDate(nextRecord.date);
    setSelectedRecordId(nextRecord.id);
    setOverlayMode("view");
  };

  const deleteRecord = (recordId) => {
    const shouldDelete = window.confirm("이 게시물을 삭제할까요?");

    if (!shouldDelete) return;

    setRecords((prev) => prev.filter((record) => record.id !== recordId));
    closeOverlay();
  };

  const moveMonth = (amount) => {
    setCurrentMonth((prev) => {
      const next = new Date(prev);
      next.setMonth(prev.getMonth() + amount);
      return next;
    });
  };

  const goToday = () => {
    const today = new Date();

    setCurrentMonth(today);
    setSelectedDate(toDateKey(today));
  };

  return (
    <main className="min-h-screen px-3 py-4 pb-28 sm:px-5 lg:px-7 lg:py-7 lg:pb-7">
      <div className="mx-auto w-full max-w-[1440px]">
        <header className={`${glassCard} mb-5 flex flex-col gap-4 p-4 lg:flex-row lg:items-center lg:justify-between`}>
          <div className="flex min-w-0 items-center gap-3">
            <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-slate-950 text-white shadow-[0_12px_28px_rgba(17,24,39,0.22)]">
              <Icon name="star" size={18} />
            </div>

            <div className="min-w-0">
              <p className="text-xs font-black text-slate-400">Daily Fan Log</p>
              <h1 className="mt-0.5 text-2xl font-black leading-tight text-slate-950">
                라이브러리
              </h1>
            </div>
          </div>

          <div className="flex flex-1 items-center gap-3 lg:justify-end">
            <label className="flex h-12 w-full max-w-md items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 text-slate-400">
              <Icon name="search" size={18} />
              <input
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="게시물 검색"
                className="w-full bg-transparent text-sm font-bold text-slate-950 outline-none placeholder:text-slate-300"
              />
            </label>

            <button
              type="button"
              className={`${primaryButton} hidden lg:inline-flex`}
              onClick={() => openCreateOverlay(todayKey)}
            >
              <Icon name="plus" size={18} />
              새 게시물
            </button>
          </div>
        </header>

        <div
          className={`grid items-start gap-5 ${
            activeView === "calendar"
              ? "lg:grid-cols-[240px_minmax(0,1fr)] xl:grid-cols-[240px_minmax(0,1fr)_330px]"
              : "lg:grid-cols-[240px_minmax(0,1fr)] xl:grid-cols-[240px_minmax(0,1fr)_280px]"
          }`}
        >
          <aside className="hidden gap-4 lg:grid">
            <section className={`${glassCard} flex items-center gap-3 p-4`}>
              <div className="grid h-[52px] w-[52px] place-items-center rounded-3xl bg-gradient-to-br from-slate-950 to-indigo-600 text-2xl font-black text-white">
                F
              </div>
              <div>
                <strong className="block text-base font-black text-slate-950">My Space</strong>
                <span className="mt-1 block text-sm font-bold text-slate-400">
                  개인 팬활동 기록장
                </span>
              </div>
            </section>

            <section className={`${glassCard} p-4`}>
              <div className="text-xs font-black text-slate-400">메뉴</div>
              <nav className="mt-3 grid gap-2">
                {viewOptions.map((view) => (
                  <button
                    type="button"
                    key={view.value}
                    className={`flex min-h-11 items-center gap-3 rounded-2xl px-3 text-left text-sm font-black transition ${
                      activeView === view.value
                        ? "bg-slate-950 text-white"
                        : "text-slate-500 hover:bg-slate-100"
                    }`}
                    onClick={() => setActiveView(view.value)}
                  >
                    <Icon name={view.icon} size={18} />
                    {view.label}
                  </button>
                ))}
              </nav>
            </section>

            <section className={`${glassCard} p-4`}>
              <div className="text-xs font-black text-slate-400">카테고리</div>
              <div className="mt-3 grid gap-2">
                <button
                  type="button"
                  className={`flex min-h-11 items-center justify-between rounded-2xl px-3 text-sm font-black transition ${
                    categoryFilter === "all"
                      ? "bg-slate-950 text-white"
                      : "text-slate-500 hover:bg-slate-100"
                  }`}
                  onClick={() => setCategoryFilter("all")}
                >
                  전체
                  <span
                    className={`grid h-6 min-w-7 place-items-center rounded-full px-2 text-xs ${
                      categoryFilter === "all" ? "bg-white/15 text-white" : "bg-slate-100 text-slate-400"
                    }`}
                  >
                    {records.length}
                  </span>
                </button>

                {categoryOptions.map((category) => (
                  <button
                    type="button"
                    key={category.value}
                    className={`flex min-h-11 items-center justify-between rounded-2xl px-3 text-sm font-black transition ${
                      categoryFilter === category.value
                        ? "bg-slate-950 text-white"
                        : "text-slate-500 hover:bg-slate-100"
                    }`}
                    onClick={() => setCategoryFilter(category.value)}
                  >
                    {category.label}
                    <span
                      className={`grid h-6 min-w-7 place-items-center rounded-full px-2 text-xs ${
                        categoryFilter === category.value
                          ? "bg-white/15 text-white"
                          : "bg-slate-100 text-slate-400"
                      }`}
                    >
                      {records.filter((record) => record.category === category.value).length}
                    </span>
                  </button>
                ))}
              </div>
            </section>
          </aside>

          <div className="min-w-0">
            {activeView === "calendar" && (
              <CalendarView
                cells={cells}
                recordsByDate={recordsByDate}
                selectedDate={selectedDate}
                setSelectedDate={setSelectedDate}
                todayKey={todayKey}
                currentMonth={currentMonth}
                records={records}
                monthRecordCount={monthRecordCount}
                photoCount={photoCount}
                onMoveMonth={moveMonth}
                onToday={goToday}
                onCreate={openCreateOverlay}
                onOpenRecord={openViewOverlay}
                onOpenDayPosts={openDayPosts}
              />
            )}

            {activeView === "collection" && (
              <CollectionView
                records={records}
                filteredRecords={filteredRecords}
                categoryFilter={categoryFilter}
                setCategoryFilter={setCategoryFilter}
                onOpenRecord={openViewOverlay}
                onCreate={() => openCreateOverlay(todayKey)}
              />
            )}

            {activeView === "gallery" && (
              <GalleryView
                records={records}
                filteredRecords={filteredRecords}
                categoryFilter={categoryFilter}
                setCategoryFilter={setCategoryFilter}
                onOpenRecord={openViewOverlay}
                onCreate={() => openCreateOverlay(todayKey)}
              />
            )}
          </div>

          <aside className="grid gap-4 xl:block xl:space-y-4">
            {activeView === "calendar" ? (
              <section className={`${glassCard} p-4`}>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-black text-slate-400">Selected Day</p>
                    <h2 className="mt-1 text-xl font-black leading-tight text-slate-950">
                      {getReadableDate(selectedDate)}
                    </h2>
                  </div>

                  <button
                    type="button"
                    className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-slate-950 text-white"
                    onClick={() => openCreateOverlay(selectedDate)}
                  >
                    <Icon name="plus" />
                  </button>
                </div>

                {selectedDayRecords.length > 0 ? (
                  <div className="mt-4 grid gap-3">
                    {selectedDayRecords.map((record) => (
                      <button
                        type="button"
                        key={record.id}
                        className="grid w-full grid-cols-[62px_minmax(0,1fr)] items-center gap-3 rounded-3xl border border-slate-200 bg-white p-2.5 text-left transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-[0_10px_26px_rgba(17,24,39,0.08)]"
                        onClick={() => openViewOverlay(record.id)}
                      >
                        {record.thumbnail ? (
                          <img
                            className="aspect-[9/16] h-[76px] w-[42px] justify-self-center rounded-2xl object-cover"
                            src={record.thumbnail}
                            alt={record.title}
                          />
                        ) : (
                          <div className="grid aspect-[9/16] h-[76px] w-[42px] place-items-center justify-self-center rounded-2xl bg-slate-100 text-slate-400">
                            <Icon name="image" size={18} />
                          </div>
                        )}

                        <div className="min-w-0">
                          <strong className="block truncate text-sm font-black text-slate-950">
                            {record.title}
                          </strong>
                          <span className="mt-1 block text-xs font-black text-slate-400">
                            {getCategoryLabel(record.category)}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="grid min-h-64 place-items-center text-center text-slate-400">
                    <div>
                      <Icon name="calendar" size={30} />
                      <strong className="mt-3 block text-lg font-black text-slate-950">
                        게시물이 없습니다
                      </strong>
                      <p className="mt-2 text-sm font-bold leading-6 text-slate-500">
                        이 날짜에 감상이나 사진을 남겨보세요.
                      </p>
                      <button
                        type="button"
                        className={`${primaryButton} mt-5`}
                        onClick={() => openCreateOverlay(selectedDate)}
                      >
                        게시물 추가
                      </button>
                    </div>
                  </div>
                )}
              </section>
            ) : (
              <section className={`${glassCard} p-4`}>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-black text-slate-400">Overview</p>
                    <h2 className="mt-1 text-xl font-black leading-tight text-slate-950">
                      내 기록 요약
                    </h2>
                  </div>

                  <button
                    type="button"
                    className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-slate-950 text-white"
                    onClick={() => openCreateOverlay(todayKey)}
                  >
                    <Icon name="plus" />
                  </button>
                </div>

                <div className="mt-4 grid gap-3">
                  {[
                    { label: "전체 게시물", value: records.length },
                    { label: "이미지", value: photoCount },
                    { label: "YouTube", value: youtubeCount },
                  ].map((item) => (
                    <div
                      key={item.label}
                      className="flex min-h-14 items-center justify-between rounded-2xl border border-slate-200 bg-white px-4"
                    >
                      <span className="text-sm font-black text-slate-400">{item.label}</span>
                      <strong className="text-2xl font-black text-slate-950">{item.value}</strong>
                    </div>
                  ))}
                </div>
              </section>
            )}

            <section className="rounded-[2rem] bg-gradient-to-br from-slate-950 to-slate-700 p-5 text-white shadow-[0_10px_30px_rgba(17,24,39,0.12)]">
              <span className="inline-flex h-8 items-center rounded-full bg-white/10 px-3 text-xs font-black">
                Tip
              </span>
              <p className="mt-3 text-sm font-bold leading-7 text-white/75">
                하루에 여러 게시물을 등록할 수 있습니다. 같은 날짜에 여러 게시물이 있으면
                캘린더에서 카드가 겹쳐 보이고, 날짜를 누르면 선택 팝업이 열립니다.
              </p>
            </section>
          </aside>
        </div>
      </div>

      <nav className="fixed bottom-4 left-1/2 z-30 grid min-h-[72px] w-[min(430px,calc(100%-28px))] -translate-x-1/2 grid-cols-[1fr_1fr_1fr_62px] items-center gap-1.5 rounded-[1.75rem] border border-white/70 bg-white/90 p-2 shadow-[0_18px_60px_rgba(17,24,39,0.16)] backdrop-blur-xl lg:hidden">
        {viewOptions.map((view) => (
          <button
            type="button"
            key={view.value}
            className={`grid min-h-14 place-items-center gap-1 rounded-2xl text-[11px] font-black transition ${
              activeView === view.value ? "bg-slate-100 text-slate-950" : "text-slate-400"
            }`}
            onClick={() => setActiveView(view.value)}
          >
            <Icon name={view.icon} />
            {view.label}
          </button>
        ))}

        <button
          type="button"
          className="grid h-[58px] w-[58px] place-items-center rounded-full bg-slate-950 text-white shadow-[0_14px_30px_rgba(17,24,39,0.26)]"
          onClick={() => openCreateOverlay(todayKey)}
          aria-label="새 게시물 추가"
        >
          <Icon name="plus" size={24} />
        </button>
      </nav>

      {dayPostsSheet && (
        <DayPostsSheet
          date={dayPostsSheet.date}
          records={dayPostsSheet.records}
          onClose={() => setDayPostsSheet(null)}
          onOpenRecord={openViewOverlay}
          onCreate={openCreateOverlay}
        />
      )}

      {overlayMode && (
        <RecordOverlay
          mode={overlayMode}
          record={selectedRecord}
          selectedDate={selectedDate}
          onClose={closeOverlay}
          onSave={saveRecord}
          onDelete={deleteRecord}
          onRequestEdit={() => setOverlayMode("edit")}
        />
      )}
    </main>
  );
}