import type { Language } from "../types";

const english: Record<string, string> = {
  "nav.account": "Account",
  "account.eyebrow": "Optional cloud sync",
  "account.title": "Your OpenVox account",
  "account.body":
    "Sign in to keep practice summaries and goals in sync across your devices.",
  "account.guestTitle": "Practice locally or sign in",
  "account.guestBody":
    "Guest mode stays available. Creating an account does not upload recordings or live microphone audio.",
  "account.login": "Sign in",
  "account.register": "Create account",
  "account.name": "Display name",
  "account.email": "Email",
  "account.password": "Password",
  "account.passwordHelp": "Use at least 10 characters.",
  "account.haveAccount": "Already have an account?",
  "account.needAccount": "New to OpenVox?",
  "account.loggingIn": "Signing in…",
  "account.registering": "Creating account…",
  "account.profile": "Signed-in profile",
  "account.logout": "Sign out",
  "account.syncTitle": "Practice sync",
  "account.syncBody":
    "Training summaries and weekly goals are sent over this site connection and stored by this OpenVox server. Use HTTPS outside localhost.",
  "account.syncNow": "Sync now",
  "account.syncing": "Syncing…",
  "account.synced": "Synced",
  "account.offline": "Waiting for a connection",
  "account.syncError": "Sync needs attention",
  "account.local": "Local only",
  "account.lastSync": "Last sync",
  "account.never": "Not synced yet",
  "account.sessions": "practice sessions on this device",
  "account.goals": "active goals on this device",
  "account.privacyTitle": "Audio stays local",
  "account.privacyBody":
    "Real-time pitch detection, microphone input, recordings and imported audio remain on this device. Only practice summaries and goals are synchronized.",
  "account.errorConnect":
    "Cannot connect to the account service. Check that the API container is running.",
  "account.errorCredentials": "The email address or password is incorrect.",
  "account.errorExists": "An account with this email already exists.",
  "account.errorOwner":
    "This browser already contains practice data associated with another account. Use a separate browser profile to keep the accounts isolated.",
  "account.errorGeneric":
    "The request could not be completed. Please try again.",
  "progress.cloudSynced":
    "Practice records are synchronized with your account.",
  "progress.guestLocal":
    "You are using guest mode. Practice records remain only in this browser.",
  "progress.manageAccount": "Manage account",
};

const chinese: Record<string, string> = {
  "nav.account": "账号",
  "account.eyebrow": "可选云端同步",
  "account.title": "你的 OpenVox 账号",
  "account.body": "登录后，可在多台设备之间同步练习摘要和练习目标。",
  "account.guestTitle": "本地练习或登录账号",
  "account.guestBody":
    "游客模式会一直保留。创建账号不会上传录音或实时麦克风音频。",
  "account.login": "登录",
  "account.register": "创建账号",
  "account.name": "显示名称",
  "account.email": "邮箱",
  "account.password": "密码",
  "account.passwordHelp": "密码至少需要 10 个字符。",
  "account.haveAccount": "已经有账号？",
  "account.needAccount": "第一次使用 OpenVox？",
  "account.loggingIn": "正在登录…",
  "account.registering": "正在创建账号…",
  "account.profile": "已登录账号",
  "account.logout": "退出登录",
  "account.syncTitle": "练习数据同步",
  "account.syncBody":
    "练习摘要和每周目标会通过当前站点连接发送，并保存在这台 OpenVox 服务器中。在 localhost 以外部署时请启用 HTTPS。",
  "account.syncNow": "立即同步",
  "account.syncing": "正在同步…",
  "account.synced": "已同步",
  "account.offline": "等待网络连接",
  "account.syncError": "同步遇到问题",
  "account.local": "仅保存在本地",
  "account.lastSync": "上次同步",
  "account.never": "尚未同步",
  "account.sessions": "条本机练习记录",
  "account.goals": "个本机有效目标",
  "account.privacyTitle": "音频仍保留在本地",
  "account.privacyBody":
    "实时音高检测、麦克风输入、录音和导入的音频仍在本机处理。只有练习摘要和目标会同步。",
  "account.errorConnect": "无法连接账号服务，请检查 API 容器是否已经启动。",
  "account.errorCredentials": "邮箱或密码不正确。",
  "account.errorExists": "这个邮箱已经注册。",
  "account.errorOwner":
    "这个浏览器中已有属于另一个账号的练习数据。请使用独立的浏览器用户配置，避免不同账号的数据混在一起。",
  "account.errorGeneric": "操作未能完成，请稍后重试。",
  "progress.cloudSynced": "练习记录正在与你的账号同步。",
  "progress.guestLocal": "当前为游客模式，练习记录只保存在这个浏览器中。",
  "progress.manageAccount": "管理账号",
};

const accountTranslations: Record<Language, Record<string, string>> = {
  en: english,
  uk: english,
  de: english,
  zh: chinese,
};

export function accountText(language: Language, key: string) {
  return accountTranslations[language][key] || english[key] || key;
}
