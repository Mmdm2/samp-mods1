import { useState } from 'react';
import { BookOpen, Cpu, Zap, ChevronDown, ChevronRight, Code2, Package, Image, Settings, Monitor, HardDrive, Gamepad2, Star, AlertTriangle, CheckCircle } from 'lucide-react';

interface Section {
  id: string;
  icon: React.ElementType;
  title: string;
  titleEn: string;
  color: string;
  steps: Step[];
}

interface Step {
  title: string;
  content: string;
  code?: string;
  tip?: string;
  warn?: string;
}

const SECTIONS: Section[] = [
  {
    id: 'first-mod',
    icon: Code2,
    title: 'اولین مود SA-MP',
    titleEn: 'Your First SA-MP Mod',
    color: 'orange',
    steps: [
      {
        title: 'ابزار مورد نیاز',
        content: 'قبل از شروع، این نرم‌افزارها را نصب کنید:\n• Pawno (ویرایشگر Pawn) — داخل پوشه SAMP سرور\n• SA-MP Server 0.3.7 یا 0.3DL\n• Notepad++ برای ویرایش راحت‌تر\n• SA-MP Plugin Compiler (اختیاری)',
        tip: 'Pawno معمولاً در پوشه‌ای که سرور SA-MP را نصب کردید وجود دارد.'
      },
      {
        title: 'ساختار پوشه سرور',
        content: 'پوشه سرور باید این ساختار را داشته باشد:',
        code: `samp-server/
├── gamemodes/       ← فایل‌های .pwn و .amx
├── filterscripts/   ← فیلتر اسکریپت‌ها
├── plugins/         ← پلاگین‌های .dll یا .so
├── scriptfiles/     ← فایل‌های کمکی
├── server.cfg       ← تنظیمات سرور
└── samp-server.exe  ← فایل اجرایی`,
      },
      {
        title: 'اولین GameMode ساده',
        content: 'فایل gamemodes/mymod.pwn را بسازید و این کد را وارد کنید:',
        code: `#include <a_samp>

public OnGameModeInit() {
    SetGameModeText("My First GameMode");
    AddPlayerClass(0, 1958.3783, 1343.1572, 15.3746, 269.1425, 0, 0, 0, 0, 0, 0);
    return 1;
}

public OnPlayerConnect(playerid) {
    SendClientMessage(playerid, 0xFF6600FF, "به سرور خوش آمدید!");
    return 1;
}

public OnPlayerSpawn(playerid) {
    SetPlayerPos(playerid, 1958.3783, 1343.1572, 15.3746);
    return 1;
}`,
        tip: 'در Pawno، F5 را بزنید تا فایل کامپایل شود. فایل .amx ساخته می‌شود.'
      },
      {
        title: 'تنظیم server.cfg',
        content: 'فایل server.cfg را باز کنید و تنظیمات زیر را اعمال کنید:',
        code: `echo Executing Server Config...
lanmode 0
rcon_password YOURPASSWORD
maxplayers 50
port 7777
hostname My SA-MP Server
gamemode0 mymod 1
announce 1
chatlogging 0
onfoot_rate 40
incar_rate 40`,
      },
      {
        title: 'اجرای سرور',
        content: 'samp-server.exe را اجرا کنید. اگر کامپایل موفق بود پیام "Number of vehicle models: 0" می‌بینید. در SA-MP کلاینت به 127.0.0.1:7777 وصل شوید.',
        warn: 'اگر پنجره سیاه بلافاصله بسته شود، احتمالاً فایل .amx در مسیر gamemodes وجود ندارد یا نام آن در server.cfg اشتباه است.'
      }
    ]
  },
  {
    id: 'pawn-basics',
    icon: Zap,
    title: 'مبانی Pawn',
    titleEn: 'Pawn Scripting Basics',
    color: 'blue',
    steps: [
      {
        title: 'متغیرها و توابع پرکاربرد',
        content: 'مهم‌ترین توابع SA-MP:',
        code: `// ارسال پیام به بازیکن
SendClientMessage(playerid, 0xFF6600FF, "متن پیام");

// ارسال پیام به همه
SendClientMessageToAll(0xFFFFFFFF, "پیام عمومی");

// گرفتن نام بازیکن
new pName[MAX_PLAYER_NAME];
GetPlayerName(playerid, pName, sizeof(pName));

// تنظیم موقعیت
SetPlayerPos(playerid, 0.0, 0.0, 3.5);

// گرفتن موقعیت
new Float:x, Float:y, Float:z;
GetPlayerPos(playerid, x, y, z);

// دادن سلاح
GivePlayerWeapon(playerid, 24, 100); // Desert Eagle + 100 گلوله`,
      },
      {
        title: 'کار با دیالوگ',
        content: 'نمایش پنجره دیالوگ به بازیکن:',
        code: `#define DIALOG_LOGIN 1

// نمایش دیالوگ ورود
ShowPlayerDialog(playerid, DIALOG_LOGIN, DIALOG_STYLE_INPUT,
    "ورود به سرور",
    "لطفاً رمز عبور خود را وارد کنید:",
    "تأیید", "لغو");

// پردازش پاسخ
public OnDialogResponse(playerid, dialogid, response, listitem, inputtext[]) {
    if(dialogid == DIALOG_LOGIN) {
        if(response) {
            // بازیکن تأیید کرد
            printf("رمز: %s", inputtext);
        }
    }
    return 1;
}`,
      },
      {
        title: 'سیستم دستورات با ZCMD',
        content: 'با ZCMD می‌توانید دستورات سریع بسازید:',
        code: `#include <zcmd>

CMD:help(playerid, params[]) {
    SendClientMessage(playerid, 0x00FF00FF, "/heal - هیل کامل");
    SendClientMessage(playerid, 0x00FF00FF, "/veh [id] - سوار ماشین");
    return 1;
}

CMD:heal(playerid, params[]) {
    SetPlayerHealth(playerid, 100.0);
    SendClientMessage(playerid, 0xFF6600FF, "شما هیل شدید!");
    return 1;
}

CMD:veh(playerid, params[]) {
    new vehicleid;
    if(sscanf(params, "d", vehicleid))
        return SendClientMessage(playerid, -1, "استفاده: /veh [id]");
    CreateVehicle(vehicleid, 0.0, 0.0, 3.5, 0.0, -1, -1, 100);
    return 1;
}`,
        tip: 'ZCMD را از پوشه includes در کنار a_samp قرار دهید.'
      }
    ]
  },
  {
    id: 'txd-mod',
    icon: Image,
    title: 'ساخت مود تکسچر (TXD)',
    titleEn: 'Texture Modding (TXD)',
    color: 'green',
    steps: [
      {
        title: 'ابزار مورد نیاز',
        content: '• Magic TXD — بهترین ابزار برای ویرایش TXD\n• TXD Workshop — قدیمی‌تر اما هنوز کار می‌کند\n• Adobe Photoshop یا GIMP برای ویرایش تصاویر\n• DXTBmp برای تبدیل فرمت',
        tip: 'Magic TXD رایگان است و بهترین پشتیبانی از GTA SA دارد.'
      },
      {
        title: 'ویرایش تکسچر با Magic TXD',
        content: '1. Magic TXD را باز کنید\n2. File > Open > فایل TXD را انتخاب کنید\n3. روی تکسچر مورد نظر کلیک کنید\n4. گزینه "Replace" را بزنید\n5. تصویر PNG یا BMP جدید را انتخاب کنید\n6. فرمت را DXT1 (بدون شفافیت) یا DXT3/DXT5 (با شفافیت) انتخاب کنید\n7. File > Save تا ذخیره شود',
        warn: 'ابعاد تصویر باید به توان 2 باشد: 64×64، 128×128، 256×256، 512×512'
      },
      {
        title: 'مسیرهای مهم TXD',
        content: 'فایل‌های TXD اصلی GTA SA:',
        code: `GTA San Andreas/models/
├── gta3.img          ← بیشتر تکسچرها و مدل‌ها
├── gta_int.img       ← محیط داخلی
├── player.img        ← اسکین‌های بازیکن
└── gta3.dir          ← فهرست فایل‌های .img

GTA San Andreas/models/txd/
├── hud.txd           ← رابط کاربری
├── fonts.txd         ← فونت‌ها
└── loadscs.txd       ← صفحه لودینگ`,
      },
      {
        title: 'استخراج از .img',
        content: 'برای دسترسی به TXD داخل gta3.img:\n1. IMG Tool v2.0 یا Spark را باز کنید\n2. gta3.img را باز کنید\n3. فایل .txd را جستجو کنید\n4. Extract کنید\n5. با Magic TXD ویرایش کنید\n6. دوباره در .img وارد کنید (Import)',
      }
    ]
  },
  {
    id: 'cleo',
    icon: Package,
    title: 'اسکریپت‌نویسی CLEO',
    titleEn: 'CLEO Scripting',
    color: 'purple',
    steps: [
      {
        title: 'CLEO چیست؟',
        content: 'CLEO یک پلاگین برای GTA SA است که اجازه می‌دهد اسکریپت‌های .cs را در بازی اجرا کنید بدون اینکه main.scm را تغییر دهید. اسکریپت‌ها در پوشه CLEO/ قرار می‌گیرند.',
        tip: 'CLEO 4.3+ را از cleo.li دانلود کنید. با SA-MP کاملاً سازگار است.'
      },
      {
        title: 'Sanny Builder',
        content: 'Sanny Builder بهترین ابزار برای نوشتن اسکریپت CLEO است:\n1. Sanny Builder را نصب کنید\n2. File > New ساخته و نوع را GTA SA انتخاب کنید\n3. کد بنویسید\n4. F6 برای کامپایل به .cs\n5. فایل .cs را در پوشه CLEO/ قرار دهید',
      },
      {
        title: 'اسکریپت ساده CLEO',
        content: 'یک اسکریپت ساده برای اضافه کردن سلاح با کلید F1:',
        code: `{$CLEO .cs}
// اسکریپت دریافت سلاح با F1

:START
wait 0
if
    0AB0: key_pressed 112  // F1
then
    0A8C: write_memory 0xB7CEE4 size 1 value 0 virtual_protect 0
    01B2: give_player_weapon 24 ammo 100  // Desert Eagle
    03E5: show_text_styled "سلاح دریافت شد!" time 2000 style 1
    wait 500
end
jump @START`,
        tip: 'کد 112 برای کلید F1 است. لیست کدها در مستندات Sanny Builder موجود است.'
      }
    ]
  },
  {
    id: 'fps',
    icon: Monitor,
    title: 'بهبود FPS',
    titleEn: 'FPS Optimization',
    color: 'yellow',
    steps: [
      {
        title: 'تنظیمات گرافیکی بازی',
        content: 'در تنظیمات گرافیکی GTA SA:\n• Resolution: 1280×720 یا کمتر\n• Draw Distance: حداقل ممکن\n• Visual FX Quality: Low\n• Anti-aliasing: Off\n• Texture Quality: Medium یا Low\n• Shadow: Off یا Blob\n• Reflection: Off\n• MipMapping: On (این افزایش FPS می‌دهد!)',
        tip: 'بیشترین افت FPS از Draw Distance و Shadow است — اول اینها را کم کنید.'
      },
      {
        title: 'پچ‌های رسمی FPS',
        content: '• GTA SA Limit Adjuster — حافظه بیشتر به بازی می‌دهد\n• SilentPatch — باگ‌های FPS را برطرف می‌کند\n• Widescreen Fix — نسبت صفحه‌نمایش را درست می‌کند\n• DXVK — DirectX 9 را به Vulkan تبدیل می‌کند (افزایش قابل توجه در GPU‌های جدید)',
        tip: 'SilentPatch به تنهایی می‌تواند تا 30 FPS اضافه کند روی سیستم‌های مدرن.'
      },
      {
        title: 'تنظیمات ویندوز',
        content: '• حالت عملکرد را در ویندوز روی "High Performance" بگذارید\n• در NVIDIA Control Panel:\n  - Power Management: Prefer Maximum Performance\n  - Threaded Optimization: On\n  - Vertical Sync: Off\n• در AMD Radeon Software:\n  - Anti-Lag: On\n  - Radeon Chill: Off',
        warn: 'Vsync را در بازی و درایور خاموش کنید — GTA SA با Vsync کُند می‌شود.'
      },
      {
        title: 'بهینه‌سازی سیستم',
        content: '• Task Manager: برنامه‌های پس‌زمینه را ببندید\n• msconfig: Startup items غیرضروری را غیرفعال کنید\n• CPU Priority: در Task Manager، GTA SA را روی High بگذارید\n• Disable Xbox Game Bar: در ویندوز 10/11 (Win+G → Settings)\n• Fullscreen Optimizations: روی اجرایی بازی راست‌کلیک > Properties > Compatibility > Disable fullscreen optimizations',
        tip: 'بستن Chrome و برنامه‌های سنگین می‌تواند 10-20 FPS اضافه کند.'
      },
      {
        title: 'مود‌های بهبود FPS',
        content: '• FrameLimit Modifier CLEO — محدودیت فریم را برمی‌دارد\n• Low Graphics Mod — تکسچرها را کاهش می‌دهد\n• DXT1 Texture Pack — همه تکسچرها با فشرده‌سازی بهتر\n• Remove Excessive Shadows CLEO — سایه‌های اضافی را حذف می‌کند',
        code: `// در CLEO برای حذف محدودیت FPS:
{$CLEO .cs}
:MAIN
wait 0
0A8C: write_memory 0x619A50 size 1 value 0 virtual_protect 0
end_thread`,
      }
    ]
  },
  {
    id: 'server-setup',
    icon: Settings,
    title: 'راه‌اندازی سرور',
    titleEn: 'Server Setup Guide',
    color: 'red',
    steps: [
      {
        title: 'نصب و پیکربندی',
        content: 'برای راه‌اندازی سرور SA-MP:\n1. سرور SA-MP 0.3.7 یا open.mp را دانلود کنید\n2. پلاگین‌های مورد نیاز را نصب کنید:\n   - MySQL (برای پایگاه داده)\n   - sscanf2 (برای پردازش پارامتر)\n   - Streamer (برای افکت‌های دور)\n   - ZCMD (برای دستورات)\n3. GameMode مورد نظر را در gamemodes/ قرار دهید',
      },
      {
        title: 'server.cfg کامل',
        content: 'یک server.cfg استاندارد برای سرور ایرانی:',
        code: `echo Executing Server Config...
lanmode 0
rcon_password SecurePass123
maxplayers 100
port 7777
hostname [IR] My Roleplay Server | ایران رول پلی
gamemode0 irp 1
filterscripts anticheat vip
plugins sscanf mysql streamer
announce 1
chatlogging 1
onfoot_rate 40
incar_rate 40
weapon_rate 40
stream_distance 200.0
stream_rate 1000
maxnpc 0`,
      },
      {
        title: 'اتصال به MySQL',
        content: 'برای ذخیره داده‌های بازیکن با MySQL پلاگین:',
        code: `#include <a_samp>
#include <a_mysql>

#define DB_HOST "localhost"
#define DB_USER "root"
#define DB_PASS "password"
#define DB_NAME "sampdb"

new MySQL:g_SQL;

public OnGameModeInit() {
    g_SQL = mysql_connect(DB_HOST, DB_USER, DB_PASS, DB_NAME);
    if(mysql_errno(g_SQL) != 0) {
        print("خطا در اتصال به دیتابیس!");
        SendRconCommand("exit");
    } else {
        print("اتصال به MySQL موفق");
    }
    return 1;
}`,
        warn: 'هرگز رمز دیتابیس را مستقیم در کد اصلی ننویسید. از فایل جداگانه استفاده کنید.'
      }
    ]
  }
];

const colorMap: Record<string, string> = {
  orange: 'text-orange-400 border-orange-500/30 bg-orange-500/10',
  blue: 'text-blue-400 border-blue-500/30 bg-blue-500/10',
  green: 'text-green-400 border-green-500/30 bg-green-500/10',
  purple: 'text-purple-400 border-purple-500/30 bg-purple-500/10',
  yellow: 'text-yellow-400 border-yellow-500/30 bg-yellow-500/10',
  red: 'text-red-400 border-red-500/30 bg-red-500/10',
};

export default function Tutorial() {
  const [activeSection, setActiveSection] = useState<string | null>('first-mod');
  const [openSteps, setOpenSteps] = useState<Record<string, boolean>>({});

  function toggleStep(id: string) {
    setOpenSteps(prev => ({ ...prev, [id]: !prev[id] }));
  }

  const section = SECTIONS.find(s => s.id === activeSection);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="card bg-gradient-to-r from-orange-500/10 to-dark-300 border-orange-500/20">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-orange-500/20 border border-orange-500/40 flex items-center justify-center shrink-0">
            <BookOpen size={24} className="text-orange-500" />
          </div>
          <div>
            <h2 className="font-orbitron font-black text-white tracking-wide">آموزش مود سازی</h2>
            <p className="text-sm text-gray-400 font-rajdhani mt-0.5">GTA SA — SAMP — CLEO — بهبود FPS</p>
          </div>
          <div className="ml-auto badge-orange">
            <Star size={10} />
            {SECTIONS.length} دوره
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-5">
        {/* Section list */}
        <div className="space-y-2">
          {SECTIONS.map(s => {
            const Icon = s.icon;
            const colors = colorMap[s.color] || colorMap.orange;
            const active = activeSection === s.id;
            return (
              <button
                key={s.id}
                onClick={() => setActiveSection(s.id)}
                className={`w-full text-right p-3 rounded-xl border transition-all flex items-center gap-3 ${active ? colors : 'bg-dark-300 border-dark-50 hover:border-orange-500/20 text-gray-400 hover:text-white'}`}
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${active ? 'bg-current/20' : 'bg-dark-400'}`}>
                  <Icon size={15} className={active ? '' : 'text-gray-500'} />
                </div>
                <div className="text-right min-w-0">
                  <p className="text-sm font-rajdhani font-bold leading-tight truncate">{s.title}</p>
                  <p className="text-[10px] opacity-60 font-rajdhani">{s.titleEn}</p>
                </div>
                {active && <ChevronRight size={14} className="shrink-0 ml-auto" />}
              </button>
            );
          })}
        </div>

        {/* Content */}
        <div className="lg:col-span-3">
          {section ? (
            <div className="card space-y-4">
              <div className="flex items-center gap-3 pb-4 border-b border-dark-50">
                <section.icon size={20} className={colorMap[section.color].split(' ')[0]} />
                <div>
                  <h3 className="font-rajdhani font-bold text-white text-lg">{section.title}</h3>
                  <p className="text-xs text-gray-500 font-rajdhani">{section.titleEn}</p>
                </div>
                <div className="ml-auto badge-orange">{section.steps.length} مرحله</div>
              </div>

              <div className="space-y-3">
                {section.steps.map((step, idx) => {
                  const stepId = `${section.id}-${idx}`;
                  const open = openSteps[stepId] !== false; // default open
                  return (
                    <div key={idx} className="border border-dark-50 rounded-xl overflow-hidden">
                      <button
                        onClick={() => toggleStep(stepId)}
                        className="w-full flex items-center gap-3 p-4 text-right hover:bg-dark-300 transition-colors"
                      >
                        <div className="w-7 h-7 rounded-lg bg-orange-500/20 border border-orange-500/30 flex items-center justify-center shrink-0">
                          <span className="text-xs font-mono text-orange-400 font-bold">{idx + 1}</span>
                        </div>
                        <span className="font-rajdhani font-bold text-sm text-white flex-1 text-right">{step.title}</span>
                        {open ? <ChevronDown size={14} className="text-gray-500 shrink-0" /> : <ChevronRight size={14} className="text-gray-500 shrink-0" />}
                      </button>

                      {open && (
                        <div className="px-4 pb-4 space-y-3">
                          <p className="text-sm text-gray-300 font-rajdhani leading-relaxed whitespace-pre-line">{step.content}</p>

                          {step.code && (
                            <div className="bg-dark-500 rounded-lg p-3 border border-dark-50">
                              <pre className="text-xs font-mono text-green-400 leading-relaxed overflow-x-auto whitespace-pre">{step.code}</pre>
                            </div>
                          )}

                          {step.tip && (
                            <div className="flex gap-2.5 p-3 bg-green-500/8 border border-green-500/20 rounded-lg">
                              <CheckCircle size={14} className="text-green-400 shrink-0 mt-0.5" />
                              <p className="text-xs text-green-300 font-rajdhani leading-relaxed">{step.tip}</p>
                            </div>
                          )}

                          {step.warn && (
                            <div className="flex gap-2.5 p-3 bg-yellow-500/8 border border-yellow-500/20 rounded-lg">
                              <AlertTriangle size={14} className="text-yellow-400 shrink-0 mt-0.5" />
                              <p className="text-xs text-yellow-300 font-rajdhani leading-relaxed">{step.warn}</p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="card flex flex-col items-center justify-center py-20 text-center">
              <BookOpen size={40} className="text-gray-700 mb-4" />
              <p className="font-rajdhani font-bold text-gray-500">یک موضوع انتخاب کنید</p>
            </div>
          )}

          {/* Quick tips */}
          <div className="mt-5 card">
            <div className="flex items-center gap-2 mb-4">
              <HardDrive size={16} className="text-orange-400" />
              <h3 className="font-rajdhani font-bold text-orange-400">نکات سریع</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { icon: '⚡', text: 'همیشه یک نسخه پشتیبان از فایل‌های اصلی داشته باشید' },
                { icon: '🔧', text: 'در Pawno، Ctrl+F5 برای کامپایل مستقیم روی سرور' },
                { icon: '📊', text: 'با printf() می‌توانید مقادیر را در کنسول سرور چاپ کنید' },
                { icon: '🎮', text: 'ID اسلحه 24 = Desert Eagle، 30 = AK-47، 31 = M4' },
                { icon: '🗺️', text: 'برای گرفتن کوردینیت: در بازی /save بزنید (اگر GameMode پشتیبانی کند)' },
                { icon: '💡', text: 'کامپایلر می‌گوید خطا در خط چند است — همیشه از پایین شروع کنید' },
              ].map((tip, i) => (
                <div key={i} className="flex gap-3 p-3 bg-dark-300 rounded-lg border border-dark-50">
                  <span className="text-lg shrink-0">{tip.icon}</span>
                  <p className="text-xs text-gray-300 font-rajdhani leading-relaxed">{tip.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
