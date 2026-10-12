/* eslint-disable react/prop-types, react-refresh/only-export-components */

/**
 * Modern Icon Component using React Icons
 * Provides professional icons from react-icons library
 *
 * Rule: one icon component = one name (no aliases, no library suffixes like -fi / -md).
 */

import {
  // Navigation & Dashboard
  MdDashboard,
  MdHome,
  MdMenu,
  MdCategory,
  MdAssignment,
  MdAssignmentInd,
  MdBusiness,
  MdDns,
  MdAttachFile,
  MdVpnKey,
  MdCloudUpload,

  // Documents & Files
  MdDescription,
  MdFolder,
  MdPictureAsPdf,
  MdTableChart,

  // Users & Profile
  MdAccountCircle,

  // Actions
  MdAdd,
  MdEdit,
  MdDelete,
  MdClose,
  MdRemove,
  MdVisibility,
  MdVisibilityOff,
  MdContentCopy,
  MdPlayArrow,
  MdHistory,

  // Status & Alerts
  MdCheck,
  MdCheckCircle,
  MdCancel,
  MdWarning,
  MdError,
  MdInfoOutline,

  // Arrows & Navigation
  MdArrowUpward,
  MdArrowDownward,
  MdKeyboardArrowDown,

  // Time & Calendar
  MdAccessTime,
  MdCalendarToday,
  MdHourglassEmpty,

  // Communication
  MdEmail,
  MdPhone,
  MdMessage,
  MdNotifications,

  // Settings & Tools
  MdBuild,
  MdAnalytics,

  // Security & Framework
  MdSecurity,
  MdLock,
  MdShield,
  MdVerifiedUser,
  MdVerified,

  // Charts & Reports
  MdBarChart,
  MdShowChart,

  // Theme
  MdLightMode,
  MdDarkMode,

  // Misc
  MdStar,
  MdFavorite,
  MdLink,
  MdLabel,
  MdLightbulb,
  MdPowerSettingsNew,
  MdList,
  MdBook,
  // MdWork,
  MdLocationOn,
  MdLayers,
  MdInbox,
} from "react-icons/md";
import { TbRefresh } from "react-icons/tb";
import { TiPin } from "react-icons/ti";
import {
  // Additional icons from Feather Icons
  FiActivity,
  FiClock,
  FiUser,
  FiUsers,
  FiUserPlus,
  FiUserMinus,
  FiUserCheck,
  FiDownload,
  FiLoader,
  FiChevronUp,
  FiChevronRight,
  FiChevronLeft,
  FiGitMerge,
  FiAlertCircle,
  FiGlobe,
  FiBriefcase,
  FiSearch,
  FiSettings,
  FiTrendingUp,
  FiTrendingDown,
  FiMinusCircle,
  FiFilter,
  FiAward,
  FiShield,
  FiExternalLink,
  FiMoreHorizontal,
  FiCircle,
} from "react-icons/fi";

import {
  // Heroicons for additional variety
  HiOutlineDocumentText,
  HiOutlineClipboardList,
  HiDotsVertical,
} from "react-icons/hi";
import {
  FaAngleDoubleLeft,
  FaAngleDoubleRight,
  FaAngleLeft,
  FaAngleRight,
  FaBuilding,
  FaFolderOpen,
  FaGitAlt,
  FaRocket,
} from "react-icons/fa";
import { RiRobot2Fill } from "react-icons/ri";

import { IoKeySharp } from "react-icons/io5";
import { IoIosSend, IoMdCloseCircle } from "react-icons/io";
import {
  LuUndo2,
  LuClipboardCheck,
  LuFileStack,
  LuChevronsUpDown,
  LuBug,
} from "react-icons/lu";

// One name per icon. Names describe the icon itself (no library suffix, no aliases).
const iconMap = {
  // Navigation
  dashboard: MdDashboard,
  home: MdHome,
  menu: MdMenu,
  category: MdCategory,
  assignment: MdAssignment,
  "assignment-ind": MdAssignmentInd,
  business: MdBusiness,
  building: FaBuilding,
  server: MdDns,
  "attach-file": MdAttachFile,
  "vpn-key": MdVpnKey,
  key: IoKeySharp,
  location: MdLocationOn,
  layers: MdLayers,
  inbox: MdInbox,
  list: MdList,
  book: MdBook,

  // Documents & files
  document: MdDescription,
  "file-text": HiOutlineDocumentText,
  "file-stack": LuFileStack,
  "clipboard-list": HiOutlineClipboardList,
  "clipboard-check": LuClipboardCheck,
  folder: MdFolder,
  "folder-open": FaFolderOpen,
  pdf: MdPictureAsPdf,
  table: MdTableChart,

  // Upload / download / send
  upload: MdCloudUpload,
  download: FiDownload,
  send: IoIosSend,

  // Search / analytics / charts
  search: FiSearch,
  analytics: MdAnalytics,
  "show-chart": MdShowChart,
  "bar-chart": MdBarChart,
  "trending-up": FiTrendingUp,
  "trending-down": FiTrendingDown,
  activity: FiActivity,

  // Security
  shield: MdShield,
  "shield-outline": FiShield,
  security: MdSecurity,
  lock: MdLock,
  eye: MdVisibility,
  "eye-off": MdVisibilityOff,
  "verified-user": MdVerifiedUser,
  verified: MdVerified,
  award: FiAward,

  // Settings / tools
  build: MdBuild,
  settings: FiSettings,
  power: MdPowerSettingsNew,
  bug: LuBug,
  robot: RiRobot2Fill,
  rocket: FaRocket,
  "git-alt": FaGitAlt,
  "git-merge": FiGitMerge,

  // Users
  user: FiUser,
  users: FiUsers,
  "user-plus": FiUserPlus,
  "user-minus": FiUserMinus,
  "user-check": FiUserCheck,
  "account-circle": MdAccountCircle,

  // Status
  check: MdCheck,
  "check-circle": MdCheckCircle,
  "close-circle": IoMdCloseCircle,
  cancel: MdCancel,
  warning: MdWarning,
  error: MdError,
  info: MdInfoOutline,
  "alert-circle": FiAlertCircle,
  loader: FiLoader,

  // Arrows
  "arrow-up": MdArrowUpward,
  "arrow-down": MdArrowDownward,
  "angle-left": FaAngleLeft,
  "angle-right": FaAngleRight,
  "angle-double-left": FaAngleDoubleLeft,
  "angle-double-right": FaAngleDoubleRight,
  "chevron-down": MdKeyboardArrowDown,
  "chevron-up": FiChevronUp,
  "chevron-right": FiChevronRight,
  "chevron-left": FiChevronLeft,
  "chevrons-up-down": LuChevronsUpDown,

  // Actions
  filter: FiFilter,
  plus: MdAdd,
  minus: MdRemove,
  "minus-circle": FiMinusCircle,
  close: MdClose,
  delete: MdDelete,
  edit: MdEdit,
  copy: MdContentCopy,
  play: MdPlayArrow,
  undo: LuUndo2,
  refresh: TbRefresh,
  pin: TiPin,
  "external-link": FiExternalLink,
  "more-vertical": HiDotsVertical,
  "more-horizontal": FiMoreHorizontal,
  circle: FiCircle,

  // Time
  clock: FiClock,
  time: MdAccessTime,
  calendar: MdCalendarToday,
  hourglass: MdHourglassEmpty,
  history: MdHistory,

  // Communication
  email: MdEmail,
  phone: MdPhone,
  message: MdMessage,
  notification: MdNotifications,

  // Theme
  sun: MdLightMode,
  moon: MdDarkMode,

  // Misc
  star: MdStar,
  heart: MdFavorite,
  link: MdLink,
  tag: MdLabel,
  lightbulb: MdLightbulb,
  globe: FiGlobe,
  briefcase: FiBriefcase,
};

export default function Icon({
  name,
  size = "1em",
  style = {},
  className = "",
}) {
  // Get the icon component from the map
  if (!iconMap[name]) {
    throw new Error(
      `Icon "${name}" is not available in Icon.jsx. Please add it to the iconMap or use a valid icon name.`
    );
  }
  const IconComponent = iconMap[name];

  // Convert size to number if it's a string with 'px'
  const iconSize =
    typeof size === "string" && size.includes("px")
      ? Number.parseInt(size.replace("px", ""))
      : size;

  return (
    <IconComponent
      className={className}
      style={{
        fontSize: iconSize,
        width: iconSize,
        height: iconSize,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        ...style,
      }}
      aria-label={name}
    />
  );
}

const getIconPackage = (name) => {
  const comp = iconMap[name];
  if (!comp) return "react-icons";
  const cName = comp.displayName || comp.name || "";
  const match = cName.match(/^([A-Z][a-z0-9]*?)(?=[A-Z0-9]|$)/);
  const prefix = match ? match[1].toLowerCase() : "";
  return prefix ? `react-icons/${prefix}` : "react-icons";
};

const iconNames = Object.keys(iconMap);

// Dynamically group all icons by their react-icons sub-library package
const iconGroups = Object.keys(iconMap).reduce((acc, name) => {
  const pkg = getIconPackage(name);
  if (!acc[pkg]) acc[pkg] = [];
  acc[pkg].push(name);
  return acc;
}, {});

export { iconMap, iconNames, iconGroups, getIconPackage };
