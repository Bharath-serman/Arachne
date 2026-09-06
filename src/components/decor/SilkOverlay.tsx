type SilkOverlayProps = {
  variant: "gallery" | "detail";
  active?: number;
};

type Thread = { d: string; strong?: boolean; dashed?: boolean };

const GALLERY_THREADS: Thread[] = [
  { d: "M -74 604 C 86 458, 178 682, 332 514 S 554 292, 708 458 S 982 698, 1280 424", strong: true },
  { d: "M -60 176 C 96 302, 164 120, 316 280 S 508 566, 662 398 S 896 88, 1270 240" },
  { d: "M 36 722 C 192 508, 300 746, 460 526 S 610 174, 786 370 S 1050 610, 1228 498", dashed: true },
  { d: "M 8 362 C 170 430, 260 228, 416 392 S 568 654, 740 486 S 944 178, 1208 326" },
  { d: "M 118 24 C 214 190, 338 96, 426 254 S 496 562, 642 510 S 782 188, 954 294 S 1046 624, 1156 690", strong: true },
  { d: "M 280 -34 C 336 164, 232 278, 382 346 S 572 236, 668 438 S 646 660, 814 710" },
  { d: "M 1048 -22 C 952 152, 1058 244, 900 330 S 764 486, 916 550 S 1086 586, 1214 698" },
  { d: "M -24 528 C 166 352, 288 580, 430 408 S 646 162, 744 296 S 948 498, 1160 370", dashed: true },
  { d: "M 62 96 C 222 72, 198 250, 370 226 S 532 76, 596 238 S 704 598, 902 454 S 1010 148, 1186 106" },
  { d: "M 182 692 C 300 602, 346 444, 502 568 S 646 652, 742 540 S 940 330, 1088 458" },
  { d: "M 14 246 C 158 188, 264 406, 392 336 S 640 248, 718 382 S 844 672, 1018 588 S 1086 278, 1230 256", strong: true },
  { d: "M 452 -20 C 468 128, 564 182, 494 290 S 330 446, 522 496 S 718 602, 684 738", dashed: true },
  { d: "M 760 -18 C 710 162, 846 222, 762 346 S 634 506, 808 582 S 1016 648, 976 738" },
  { d: "M 92 430 C 228 520, 364 356, 480 444 S 620 588, 760 424 S 986 264, 1120 396" },
];

const DETAIL_THREADS: Thread[] = [
  { d: "M -30 90 C 156 78, 216 220, 394 188 S 544 16, 706 176 S 918 352, 1228 36", strong: true },
  { d: "M -62 276 C 138 408, 282 166, 430 324 S 592 564, 758 400 S 1032 124, 1240 256" },
  { d: "M 8 516 C 194 318, 342 600, 484 404 S 650 124, 842 330 S 1046 650, 1216 500", dashed: true },
  { d: "M -20 808 C 170 634, 306 904, 466 690 S 660 430, 820 576 S 1084 842, 1238 662" },
  { d: "M 20 1140 C 198 958, 310 1228, 500 1014 S 742 666, 906 844 S 1058 1180, 1222 1076", strong: true },
  { d: "M 84 1514 C 232 1268, 378 1462, 536 1248 S 704 914, 884 1084 S 1024 1408, 1172 1328" },
  { d: "M 170 -32 C 292 150, 218 276, 370 356 S 490 590, 344 722 S 230 1052, 420 1202 S 532 1414, 464 1534" },
  { d: "M 552 -28 C 514 168, 644 228, 564 382 S 424 556, 608 674 S 776 916, 648 1036 S 618 1304, 776 1518", dashed: true },
  { d: "M 1012 -18 C 884 160, 1032 244, 902 402 S 804 698, 1008 750 S 1120 1016, 966 1130 S 894 1342, 1032 1524" },
  { d: "M 1160 16 C 1030 192, 1170 334, 1030 446 S 892 698, 1098 822 S 1218 1098, 1060 1232 S 1034 1430, 1144 1512" },
  { d: "M 28 382 C 176 286, 286 472, 430 424 S 610 274, 716 438 S 874 736, 1044 614 S 1090 358, 1218 390", strong: true },
  { d: "M 8 678 C 150 772, 286 570, 426 668 S 600 882, 754 730 S 942 500, 1198 620" },
  { d: "M 44 1006 C 196 906, 320 1094, 466 1012 S 668 834, 802 970 S 976 1210, 1184 1120", dashed: true },
  { d: "M 116 1322 C 264 1208, 366 1414, 520 1320 S 714 1136, 858 1282 S 1050 1476, 1208 1416" },
  { d: "M 252 110 C 342 36, 488 84, 548 210 S 504 416, 660 452 S 930 394, 970 526 S 842 770, 1022 806" },
  { d: "M 274 1478 C 350 1322, 492 1388, 558 1260 S 514 1056, 678 1012 S 916 1082, 970 932 S 874 736, 1058 690" },
];

/** Dense, imperfect silk strata used only as a non-interactive background texture. */
export function SilkOverlay({ variant, active = 0 }: SilkOverlayProps) {
  const isGallery = variant === "gallery";
  const threads = isGallery ? GALLERY_THREADS : DETAIL_THREADS;
  const coreX = isGallery ? 600 + (active - 1.5) * 52 : 790;
  const coreY = isGallery ? 360 : 390;
  const viewBox = isGallery ? "0 0 1200 720" : "0 0 1200 1500";
  const className = isGallery
    ? "pointer-events-none absolute -inset-x-[12%] -inset-y-[20%] h-[140%] w-[124%] overflow-visible opacity-90"
    : "pointer-events-none absolute -inset-x-[14%] -inset-y-[5%] h-[110%] w-[128%] overflow-visible opacity-80";

  return (
    <svg className={className} viewBox={viewBox} preserveAspectRatio="none" aria-hidden="true">
      <defs>
        <filter id={`${variant}-tangle-glow`}><feGaussianBlur stdDeviation="4.5" result="g" /><feMerge><feMergeNode in="g" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
        <radialGradient id={`${variant}-tangle-core`}><stop stopColor="var(--ember)" stopOpacity="0.54" /><stop offset="0.3" stopColor="var(--ember)" stopOpacity="0.16" /><stop offset="1" stopColor="var(--void)" stopOpacity="0" /></radialGradient>
      </defs>
      <ellipse cx={coreX} cy={coreY} rx={isGallery ? 190 : 222} ry={isGallery ? 142 : 196} fill={`url(#${variant}-tangle-core)`} opacity="0.56" />
      <g fill="none" stroke="#e8eff1" strokeLinecap="round" filter={`url(#${variant}-tangle-glow)`}>
        {threads.map((thread, index) => <path key={thread.d} d={thread.d} strokeWidth={thread.strong ? 1.55 : 0.88} strokeDasharray={thread.dashed ? "3 10" : undefined} opacity={thread.strong ? 0.34 : thread.dashed ? 0.17 : 0.23} />)}
        {isGallery ? [96, 174, 268, 346].map((radius, index) => <path key={radius} d={`M ${coreX - radius} ${coreY} C ${coreX - radius * 0.72} ${coreY - radius * 0.74}, ${coreX + radius * 0.58} ${coreY - radius * 0.62}, ${coreX + radius} ${coreY - 18} C ${coreX + radius * 0.72} ${coreY + radius * 0.7}, ${coreX - radius * 0.64} ${coreY + radius * 0.64}, ${coreX - radius} ${coreY}`} strokeWidth={index === 2 ? 1.35 : 0.9} strokeDasharray={index % 2 ? "5 12" : undefined} opacity={0.12 + index * 0.045} />) : [96, 164, 248, 338].map((radius, index) => <path key={radius} d={`M ${coreX - radius} ${coreY + 18} C ${coreX - radius * 0.76} ${coreY - radius * 0.74}, ${coreX + radius * 0.66} ${coreY - radius * 0.66}, ${coreX + radius} ${coreY + 14} C ${coreX + radius * 0.72} ${coreY + radius * 0.68}, ${coreX - radius * 0.62} ${coreY + radius * 0.7}, ${coreX - radius} ${coreY + 18}`} strokeWidth={index === 2 ? 1.3 : 0.85} strokeDasharray={index % 2 ? "4 12" : undefined} opacity={0.12 + index * 0.045} />)}
      </g>
      <g filter={`url(#${variant}-tangle-glow)`}>
        <circle cx={coreX} cy={coreY} r="7" fill="var(--ember)" opacity="0.9" />
        <circle cx={coreX} cy={coreY} r="28" fill="none" stroke="#e8eff1" strokeWidth="1" strokeDasharray="3 8" opacity="0.45" />
        <circle cx={coreX + 46} cy={coreY - 34} r="3" fill="#e8eff1" opacity="0.54" />
        <circle cx={coreX - 68} cy={coreY + 42} r="2.5" fill="#e8eff1" opacity="0.44" />
      </g>
    </svg>
  );
}
