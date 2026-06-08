export interface KnowledgeEntry {
  patterns: string[];
  answer: string;
}

export const sampKnowledge: KnowledgeEntry[] = [
  // ─── General SA-MP ───
  {
    patterns: ['samp چیست', 'sa-mp چیست', 'ساندرس انلاین', 'san andreas multiplayer', 'sa mp چیه', 'سمپ چیه'],
    answer: `**SA-MP (San Andreas Multiplayer)** یک مود آنلاین برای GTA San Andreas است که به شما اجازه می‌دهد با هزاران بازیکن دیگر در سرورهای مختلف بازی کنید.

🔹 **نسخه‌های اصلی**: SA-MP 0.3.7 R2 (آخرین نسخه رسمی)
🔹 **جایگزین مدرن**: **open.mp** (Open Multiplayer) — نسل جدید SA-MP
🔹 **زبان اسکریپت**: Pawn (.pwn / .amx)
🔹 **پورت پیش‌فرض**: 7777
🔹 **وب‌سایت**: sa-mp.mp`,
  },
  {
    patterns: ['openmp چیست', 'open.mp', 'اوپن ام پی', 'open multiplayer'],
    answer: `**Open Multiplayer (open.mp)** جانشین رسمی SA-MP است:

🔹 متن‌باز (Open Source)
🔹 باگ‌های قدیمی SA-MP برطرف شده
🔹 سازگار با اسکریپت‌های قدیمی SA-MP
🔹 پشتیبانی از بیش از 1000 پلیر همزمان
🔹 دانلود: open.mp`,
  },
  {
    patterns: ['install samp', 'نصب سمپ', 'دانلود سمپ', 'سمپ نصب'],
    answer: `**نصب SA-MP:**

1. ابتدا GTA San Andreas PC نصب کنید (نسخه 1.0)
2. SA-MP client را از **sa-mp.mp** دانلود کنید
3. فایل نصب را اجرا و مسیر GTA SA را انتخاب کنید
4. از طریق SA-MP > Browse Servers سرور موردنظر را پیدا کنید

⚠️ **مهم**: نسخه GTA باید 1.0 باشد (نه Steam)`,
  },
  // ─── Pawn Scripting ───
  {
    patterns: ['pawn چیست', 'پاون', 'اسکریپت نویسی', 'pwn', 'سیستم اسکریپت'],
    answer: `**Pawn** زبان برنامه‌نویسی اسکریپت SA-MP است:

\`\`\`pawn
#include <a_samp>

public OnGameModeInit() {
    print("سرور شروع شد!");
    SetGameModeText("My Server");
    return 1;
}

public OnPlayerConnect(playerid) {
    SendClientMessage(playerid, 0xFF8C00FF, "خوش آمدید!");
    return 1;
}
\`\`\`

🔹 پسوند: **.pwn** (سورس) → **.amx** (کامپایل شده)
🔹 کامپایلر: **pawncc** یا **Pawno IDE**`,
  },
  {
    patterns: ['sendclientmessage', 'پیام به بازیکن', 'ارسال پیام'],
    answer: `**SendClientMessage** — ارسال پیام به بازیکن:

\`\`\`pawn
// فرمت: SendClientMessage(playerid, color, message)
SendClientMessage(playerid, 0xFF8C00FF, "سلام!");
SendClientMessage(playerid, -1, "پیام سفید");
SendClientMessage(playerid, 0xFF0000FF, "پیام قرمز");

// به همه بازیکنان:
SendClientMessageToAll(0x00FF00FF, "سرور اپدیت شد!");

// با {color} inline:
SendClientMessage(playerid, -1, "{FF8C00}نارنجی {FFFFFF}سفید");
\`\`\``,
  },
  {
    patterns: ['getplayerpos', 'موقعیت بازیکن', 'position player', 'setplayerpos'],
    answer: `**موقعیت بازیکن:**

\`\`\`pawn
// دریافت موقعیت:
new Float:x, Float:y, Float:z;
GetPlayerPos(playerid, x, y, z);

// تنظیم موقعیت:
SetPlayerPos(playerid, 1000.0, -1000.0, 30.0);

// تله‌پورت به مختصات Grove Street:
SetPlayerPos(playerid, 2495.0, -1688.0, 13.3);

// دریافت زاویه:
new Float:angle;
GetPlayerFacingAngle(playerid, angle);
SetPlayerFacingAngle(playerid, 90.0); // رو به شرق
\`\`\``,
  },
  {
    patterns: ['dialog', 'دیالوگ', 'منو', 'showplayerdialog'],
    answer: `**Dialog System در SA-MP:**

\`\`\`pawn
// Dialog Types:
// DIALOG_STYLE_MSGBOX, DIALOG_STYLE_INPUT, DIALOG_STYLE_LIST,
// DIALOG_STYLE_PASSWORD, DIALOG_STYLE_TABLIST

#define DIALOG_LOGIN 1

// نمایش دیالوگ:
ShowPlayerDialog(playerid, DIALOG_LOGIN, DIALOG_STYLE_INPUT,
    "ورود به سرور",
    "لطفاً رمز عبور خود را وارد کنید:",
    "ورود", "خروج");

// پردازش پاسخ:
public OnDialogResponse(playerid, dialogid, response, listitem, inputtext[]) {
    if(dialogid == DIALOG_LOGIN) {
        if(response) {
            // response=1 دکمه اول, response=0 دکمه دوم
            printf("Password: %s", inputtext);
        }
    }
    return 1;
}
\`\`\``,
  },
  {
    patterns: ['vehicle id', 'آیدی ماشین', 'وهیکل', 'شناسه ماشین', 'vehicle ids list'],
    answer: `**Vehicle IDs (آیدی ماشین‌ها):**

\`\`\`
400 - Landstalker  |  401 - Bravura    |  402 - Buffalo
404 - Bobcat       |  405 - Mr Whoopee |  411 - Infernus
412 - Voodoo       |  415 - Cheetah    |  418 - Moon
420 - Taxi         |  421 - Washington |  422 - Bobcat
432 - Rhino (Tank) |  434 - Hotknife   |  451 - Turismo
468 - Sanchez      |  471 - Quad       |  481 - BMX
482 - Jetmax       |  487 - Maverick   |  500 - Mesa
508 - Utility Van  |  509 - Baggage    |  560 - Sultan
562 - Elegy        |  565 - Flash      |  600 - Picador
601 - S.W.A.T      |  602 - Alpha      |  603 - Phoenix
\`\`\`

\`\`\`pawn
// اسپاون ماشین:
new vehicleid = CreateVehicle(411, x, y, z, angle, color1, color2, -1);
\`\`\``,
  },
  {
    patterns: ['weapon id', 'آیدی اسلحه', 'weapon ids', 'giveplayer weapon', 'اسلحه'],
    answer: `**Weapon IDs (آیدی اسلحه‌ها):**

\`\`\`
0  - Fist/Unarmed  |  1  - Brass Knuckles
2  - Golf Club     |  3  - Nightstick
4  - Knife         |  5  - Baseball Bat
6  - Shovel        |  7  - Pool Cue
8  - Katana        |  9  - Chainsaw
22 - Pistol        |  23 - Silenced Pistol
24 - Desert Eagle  |  25 - Shotgun
26 - Sawnoff       |  27 - Combat Shotgun
28 - UZI           |  29 - MP5
30 - AK-47         |  31 - M4
32 - Tec-9         |  33 - Country Rifle
34 - Sniper Rifle  |  35 - RPG
36 - HS Rocket     |  37 - Flamethrower
38 - Minigun       |  41 - Spraycan
42 - Fire Extinguisher | 43 - Camera
\`\`\`

\`\`\`pawn
GivePlayerWeapon(playerid, 30, 500); // AK-47 با 500 تیر
\`\`\``,
  },
  {
    patterns: ['interior', 'اینتریور', 'interior id', 'setplayerinterior'],
    answer: `**Interior IDs مهم:**

\`\`\`
0  - بیرون از ساختمان (San Andreas)
1  - Roboi Food Mart / Liberty City
2  - Chinatown Food Court / Crack Den
3  - Ammu-Nation / Music Lounge
4  - Azteca's House / Crack Den
5  - Ammu-Nation Combat Zone / Sex Shop
6  - Safe House (Grove St)
7  - Penthouse / Brothel
8  - Haul Ass Trucking / Casino Interior
9  - Dirtring / Pizza Stack Kitchen
10 - Burger Shot / Jefferson Motel
11 - Wheel Arch Angels / Victim
12 - Transfender
13 - Zero's RC Shop
14 - Welcome Pump / Sex Club Int
15 - Abandoned AC Tower
\`\`\`

\`\`\`pawn
SetPlayerInterior(playerid, 1); // داخل Liberty City
SetPlayerVirtualWorld(playerid, 0); // وارد شدن به دنیا 0
\`\`\``,
  },
  {
    patterns: ['skin id', 'آیدی اسکین', 'skin ids', 'setplayerskin', 'پوشش'],
    answer: `**Skin IDs مشهور:**

\`\`\`
0   - CJ (پیش‌فرض)    |  1   - The Truth
2   - Maccer          |  7   - Bmycr
9   - Farrier         |  10  - Wfost
11  - Wfost2          |  26  - Police
29  - FBI Agent        |  42  - Army
43  - DRifle          |  56  - Army
65  - Hobo            |  74  - Pimp
86  - Biz             |  100 - SWAT
108 - LSPD Bike Cop   |  217 - Sam
264 - CJ Grove (VC)   |  280 - T-Bone Mendez
\`\`\`

\`\`\`pawn
SetPlayerSkin(playerid, 0);       // CJ
SpawnPlayer(playerid);            // ریسپاون
\`\`\``,
  },
  // ─── LUA/MTA ───
  {
    patterns: ['lua سمپ', 'lua script', 'لوا اسکریپت', 'lua gta'],
    answer: `**Lua در SA-MP (با پلاگین‌ها مثل LuaPlugin یا برای MTA:SA):**

\`\`\`lua
-- MTA:SA Server-side
addEventHandler("onPlayerJoin", root, function()
    local playerName = getPlayerName(source)
    outputChatBox("خوش آمدید " .. playerName, root, 255, 140, 0)
    giveWeapon(source, 30, 500) -- AK-47
end)

-- Teleport player
addCommandHandler("tp", function(player, cmd, x, y, z)
    setElementPosition(player, tonumber(x), tonumber(y), tonumber(z))
    outputChatBox("تله‌پورت شدید!", player, 0, 255, 0)
end)

-- SA-MP با LuaPlugin:
AddEventListener("OnPlayerConnect", function(playerid)
    SendClientMessage(playerid, 0xFF8C00FF, "سلام از Lua!")
end)
\`\`\``,
  },
  {
    patterns: ['filterscript', 'فیلترسکریپت', 'gamemode', 'گیم مود'],
    answer: `**تفاوت GameMode و FilterScript:**

🔹 **GameMode**: حالت اصلی بازی — منطق اصلی سرور
\`\`\`pawn
#include <a_samp>
// حتماً داشته باشید:
public OnGameModeInit() {
    SetGameModeText("My Gamemode");
    return 1;
}
\`\`\`

🔹 **FilterScript**: پلاگین اضافی — افزونه بدون تغییر gamemode
\`\`\`pawn
#include <a_samp>
// بدون OnGameModeInit
// با OnFilterScriptInit:
public OnFilterScriptInit() {
    print("FilterScript Load شد!");
    return 1;
}
\`\`\`

در server.cfg:
\`\`\`
gamemode0 my_gamemode 1
filterscripts my_fs anti_cheat
\`\`\``,
  },
  // ─── Cheats & Scripts ───
  {
    patterns: ['cheat script', 'چیت اسکریپت', 'ایجاد چیت', 'hack script samp', 'چیت سمپ'],
    answer: `**انواع اسکریپت در SA-MP:**

🔸 **Cheat Detection Script (آنتی چیت):**
\`\`\`pawn
public OnPlayerUpdate(playerid) {
    new Float:x, Float:y, Float:z, Float:health;
    GetPlayerPos(playerid, x, y, z);
    GetPlayerHealth(playerid, health);

    // آنتی heli hack
    if(IsPlayerInAnyVehicle(playerid)) {
        new vehicleid = GetPlayerVehicleID(playerid);
        new Float:vx, Float:vy, Float:vz;
        GetVehicleVelocity(vehicleid, vx, vy, vz);
        new Float:speed = floatsqroot(vx*vx + vy*vy + vz*vz);
        if(speed > 2.0) {
            // سرعت مشکوک
            SendClientMessage(playerid, 0xFF0000FF, "[آنتی‌چیت] شناسایی شدید!");
        }
    }
    return 1;
}
\`\`\`

🔸 **Cheat Menu (برای تست سرور):**
\`\`\`pawn
CMD:cheat(playerid, params[]) {
    if(!IsPlayerAdmin(playerid)) return 0;
    ShowPlayerDialog(playerid, DIALOG_CHEAT, DIALOG_STYLE_LIST,
        "Cheat Menu",
        "God Mode\nFull Ammo\nAll Vehicles\nMax Wanted",
        "Select", "Close");
    return 1;
}
\`\`\``,
  },
  {
    patterns: ['cleo script', 'cleo', '.cs فایل', 'cleo mod', 'cs script'],
    answer: `**CLEO Scripts (.cs) برای GTA SA:**

CLEO مود اسکریپت‌نویسی برای GTA SA تکنفره است:

\`\`\`
// مثال CLEO Script (Assembly-style):
thread 'MYMENU'
    0001: wait 0 ms
    0002: jump @MYMENU

:LOOP
    0001: wait 0 ms
    // کلید F8 = Key 119
    00D6: if 0
    0AB0: key_pressed 119
    004D: jump_if_false @LOOP

    // تله‌پورت به Grove Street
    0174: set_player 0 pos 2495.0 -1688.0 13.3
    jump @LOOP
\`\`\`

**فایل‌های CLEO:**
- **.cs** = Cold Script (اجرا از ابتدا)
- **.cm** = CLEO Mission
- **مکان**: \`GTA SA/CLEO/\`

**Opcode‌های مهم:**
- \`0001\`: wait
- \`0174\`: set_player_pos
- \`00A5\`: create_car
- \`01B2\`: give_weapon
- \`0247\`: load_model`,
  },
  {
    patterns: ['timecycle', 'تایم سایکل', 'timecyc.dat', 'آب و هوا', 'رنگ آسمان'],
    answer: `**TimeCycle چیست؟**

\`timecyc.dat\` فایل کنترل رنگ آسمان، نور و جو بازی است.

**فرمت هر ردیف:**
\`\`\`
AmbR AmbG AmbB DirR DirG DirB SkyTopR SkyTopG SkyTopB SkyBotR SkyBotG SkyBotB SunR SunG SunB...
\`\`\`

**مثال TimeCycle برای آسمان نارنجی غروب:**
\`\`\`dat
200 120 60    255 160 80    255 140 50    255 100 30    255 200 100   0.04   0 0 0   100 80 60   50   200 150 100  50 40 20   0.0   0   0.0   0.0   0   0.0   -1.0
\`\`\`

**توضیح ستون‌ها:**
1. Ambient RGB (نور محیط)
2. Directional RGB (نور مستقیم)
3. SkyTop RGB (بالای آسمان)
4. SkyBottom RGB (پایین آسمان)
5. Sun RGB + شدت
6. Shadow + Blur`,
  },
  {
    patterns: ['txd چیست', 'txd file', 'فایل txd', 'texture dictionary'],
    answer: `**TXD (Texture Dictionary)**

فایل TXD مجموعه تکسچرهای GTA SA است.

**ابزارهای ویرایش TXD:**
1. **TXD Workshop** — معروف‌ترین ابزار
2. **Magic TXD** — مدرن‌تر، از DX11 پشتیبانی می‌کند
3. **RWAnalyze** — برای بررسی ساختار

**مکان فایل‌های TXD:**
\`\`\`
GTA SA/models/gta3.img  ← بیشتر تکسچرها اینجا
GTA SA/models/txd/      ← TXD جدا
GTA SA/models/player.img← اسکین‌ها
\`\`\`

**فرمت‌های تکسچر پشتیبانی شده:**
- DXT1, DXT3 (فشرده)
- RGBA8888, RGB888
- 16-bit formats

**ویرایش سریع با Magic TXD:**
1. فایل .txd را باز کنید
2. تکسچر را انتخاب کنید
3. Import > PNG/BMP
4. Save`,
  },
  {
    patterns: ['server.cfg', 'سرور کانفیگ', 'تنظیمات سرور'],
    answer: `**server.cfg — تنظیمات سرور SA-MP:**

\`\`\`cfg
echo Executing Server Config...
lanmode 0
rcon_password mypassword123
maxplayers 100
port 7777
hostname My SAMP Server
gamemode0 my_gamemode 1
filterscripts anticheat vip
announce 0
chatlogging 0
onfoot_rate 40
incar_rate 40
weapon_rate 40
stream_distance 300.0
stream_rate 1000
maxnpc 10
logtimeformat [%H:%M:%S]
language English
mapname San Andreas
weburl www.myserver.com
\`\`\``,
  },
  {
    patterns: ['mysql plugin', 'mysql سمپ', 'دیتابیس سمپ', 'blueg'],
    answer: `**MySQL Plugin برای SA-MP:**

\`\`\`pawn
#include <a_mysql>
#define DB_HOST "localhost"
#define DB_USER "root"
#define DB_PASS "password"
#define DB_NAME "samp_db"

new MySQL:db;

public OnGameModeInit() {
    db = mysql_connect(DB_HOST, DB_USER, DB_PASS, DB_NAME);
    if(mysql_errno(db) != 0) {
        print("[MySQL] خطا در اتصال!");
    } else {
        print("[MySQL] اتصال موفق!");
    }
    return 1;
}

// کوئری async:
public OnPlayerConnect(playerid) {
    new query[128];
    format(query, sizeof(query),
        "SELECT * FROM players WHERE name='%s'",
        GetPlayerName(playerid));
    mysql_tquery(db, query, "OnPlayerLoad", "i", playerid);
    return 1;
}

forward OnPlayerLoad(playerid);
public OnPlayerLoad(playerid) {
    new rows = cache_num_rows();
    if(rows == 0) {
        // بازیکن جدید
    } else {
        // بارگذاری اطلاعات
        cache_get_value_name_int(0, "money", gPlayerMoney[playerid]);
    }
    return 1;
}
\`\`\``,
  },
  {
    patterns: ['sscanf', 'پارس کردن', 'پارامتر', 'دستور'],
    answer: `**sscanf Plugin — پارس پارامترها:**

\`\`\`pawn
#include <sscanf2>

// دستور با عدد:
CMD:give(playerid, params[]) {
    new targetid, amount;
    if(sscanf(params, "ii", targetid, amount)) {
        SendClientMessage(playerid, -1, "استفاده: /give [playerid] [amount]");
        return 1;
    }
    GivePlayerMoney(targetid, amount);
    return 1;
}

// دستور با رشته:
CMD:pm(playerid, params[]) {
    new targetid;
    new message[128];
    if(sscanf(params, "is[128]", targetid, message)) {
        SendClientMessage(playerid, -1, "/pm [id] [message]");
        return 1;
    }
    // ارسال پیام
    return 1;
}
\`\`\`

**Specifiers:**
- i/d — integer  |  f — float
- s — string     |  c — char
- p — separator  |  z — optional string`,
  },
  {
    patterns: ['streamer', 'استریمر', 'object streamer', 'create dynamic object'],
    answer: `**Streamer Plugin (توسط Incognito):**

\`\`\`pawn
#include <streamer>

// ساخت Object دینامیک:
CreateDynamicObject(modelid, x, y, z, rx, ry, rz, worldid, interiorid, playerid, streamdist);

// مثال:
new obj = CreateDynamicObject(1337, 1000.0, -1000.0, 30.0, 0.0, 0.0, 0.0, -1, -1, -1, 300.0);

// Pickup:
CreateDynamicPickup(1274, 1, 2495.0, -1688.0, 14.0, -1, -1, -1);

// PickZone:
new zone = CreateDynamicRectangle(-200.0, -200.0, 200.0, 200.0, -1, -1);

// MapIcon:
CreateDynamicMapIcon(0.0, 0.0, 5.0, 0, -1, -1, -1, 200.0);

// TextLabel:
new txt3d = CreateDynamic3DTextLabel("سلام!", 0xFFFFFFFF, 0.0, 0.0, 5.0, 30.0, .testlos = 1);
\`\`\``,
  },
  {
    patterns: ['zcmd', 'izcmd', 'ZCMD', 'CMD', 'دستور سریع'],
    answer: `**ZCMD Plugin — سریع‌ترین Command Processor:**

\`\`\`pawn
#include <zcmd>

// تعریف دستور:
CMD:spawn(playerid, params[]) {
    SpawnPlayer(playerid);
    SendClientMessage(playerid, 0x00FF00FF, "اسپاون شدید!");
    return 1;
}

CMD:veh(playerid, params[]) {
    if(!IsPlayerAdmin(playerid)) {
        SendClientMessage(playerid, 0xFF0000FF, "دسترسی ندارید!");
        return 1;
    }
    new model;
    if(sscanf(params, "i", model)) {
        SendClientMessage(playerid, -1, "/veh [modelid]");
        return 1;
    }
    new Float:x, Float:y, Float:z, Float:a;
    GetPlayerPos(playerid, x, y, z);
    GetPlayerFacingAngle(playerid, a);
    new v = CreateVehicle(model, x, y+3.0, z, a, -1, -1, -1);
    PutPlayerInVehicle(playerid, v, 0);
    return 1;
}
\`\`\``,
  },
  {
    patterns: ['rcon', 'آر کان', 'ادمین', 'admin command'],
    answer: `**RCON (Remote Console) در SA-MP:**

\`\`\`
// ورود در بازی:
/rcon login [password]

// دستورات RCON:
/rcon kick [playerid]
/rcon ban [playerid]
/rcon gmx          ← ری‌استارت گیم‌مود
/rcon reloadfs [filterscript]
/rcon say [message]
/rcon players      ← لیست بازیکنان
/rcon gravity [value] ← تغییر گرانش (0.008 پیش‌فرض)
/rcon weather [id] ← تغییر آب و هوا (0-255)
/rcon exec [file]  ← اجرای فایل cfg
\`\`\`

**در کد Pawn:**
\`\`\`pawn
IsPlayerAdmin(playerid) // چک آدمین RCON
SendRconCommand("gravity 0.001"); // تغییر گرانش
\`\`\``,
  },
  {
    patterns: ['pickups', 'پیکاپ', 'health pickup', 'armor pickup'],
    answer: `**Pickups در SA-MP:**

\`\`\`pawn
// CreatePickup(model, type, x, y, z, virtualworld)
// Type 1 = از بین نمی‌رود
// Type 2 = از بین می‌رود پس از pickup
// Type 14 = عملکرد custom

// Health:
CreatePickup(1240, 1, 1000.0, -1000.0, 30.0, -1);

// Armor:
CreatePickup(1242, 1, 1005.0, -1000.0, 30.0, -1);

// Money ($):
CreatePickup(1274, 1, 1010.0, -1000.0, 30.0, -1);

// پردازش:
public OnPlayerPickUpPickup(playerid, pickupid) {
    if(pickupid == healthPickup) {
        SetPlayerHealth(playerid, 100.0);
        SendClientMessage(playerid, 0x00FF00FF, "جان پر شد!");
    }
    return 1;
}
\`\`\``,
  },
  {
    patterns: ['spawn protect', 'حفاظت اسپاون', 'anti kill', 'spawn protection'],
    answer: `**Spawn Protection اسکریپت:**

\`\`\`pawn
new bool:gSpawnProtected[MAX_PLAYERS];
new gSpawnTimer[MAX_PLAYERS];

public OnPlayerSpawn(playerid) {
    gSpawnProtected[playerid] = true;
    SetPlayerColor(playerid, 0xFFFFFF80); // نیمه شفاف

    gSpawnTimer[playerid] = SetTimerEx("RemoveSpawnProtection", 5000, false, "i", playerid);
    SendClientMessage(playerid, 0xFFAA00FF, "[محافظت] 5 ثانیه محافظت دارید");
    return 1;
}

forward RemoveSpawnProtection(playerid);
public RemoveSpawnProtection(playerid) {
    gSpawnProtected[playerid] = false;
    SetPlayerColor(playerid, GetPlayerColor(playerid) | 0xFF);
    SendClientMessage(playerid, 0xFF0000FF, "[محافظت] محافظت تمام شد!");
}

public OnPlayerTakeDamage(playerid, ...) {
    if(gSpawnProtected[playerid]) return 0; // بلاک آسیب
    return 1;
}
\`\`\``,
  },
  {
    patterns: ['script error', 'خطای اسکریپت', 'compilation error', 'debug', 'دیباگ'],
    answer: `**خطاهای رایج Pawn و رفع آن‌ها:**

🔴 **error 017: undefined symbol**
→ متغیر یا تابع تعریف نشده. چک کنید include‌ها و تعریف متغیر.

🔴 **error 029: invalid expression, assumed zero**
→ خطای نوشتاری در expression. معمولاً جای ; یا ) اشتباه.

🔴 **warning 202: number of arguments does not match definition**
→ تعداد آرگومان اشتباه. امضای تابع را بررسی کنید.

🔴 **error 035: argument type mismatch**
→ نوع آرگومان اشتباه (مثلاً int به جای float)

\`\`\`pawn
// Float باید با Float باشد:
new Float:x = 1.0; // صحیح
new Float:y = 1;   // اشتباه - warning

// Array باید size داشته باشد:
new myArray[10];   // صحیح
new myArray[];     // اشتباه
\`\`\`

**دیباگ با printf:**
\`\`\`pawn
printf("[DEBUG] playerid=%d, money=%d", playerid, money);
\`\`\``,
  },
  {
    patterns: ['gang zone', 'گنگ زون', 'territory', 'gangzone'],
    answer: `**GangZone در SA-MP:**

\`\`\`pawn
new gZone;

// ساخت:
gZone = GangZoneCreate(
    minX, minY,  // گوشه جنوب‌غربی
    maxX, maxY   // گوشه شمال‌شرقی
);

// نمایش برای بازیکن:
GangZoneShowForPlayer(playerid, gZone, 0xFF000080); // قرمز نیمه‌شفاف
GangZoneShowForAll(gZone, 0x0000FF80); // آبی برای همه

// فلش (چشمک زدن):
GangZoneFlashForPlayer(playerid, gZone, 0xFF0000FF);
GangZoneFlashForAll(gZone, 0xFF8800FF);

// حذف:
GangZoneHideForPlayer(playerid, gZone);
GangZoneDestroy(gZone);
\`\`\``,
  },
  {
    patterns: ['نقشه', 'map gta', 'مختصات', 'coordinate', 'location'],
    answer: `**مختصات مهم GTA San Andreas:**

\`\`\`
Grove Street (CJ خانه): 2495.0, -1688.0, 13.3
Los Santos Airport: 1700.0, -2639.0, 13.3
San Fierro Airport: -1420.0, 50.0, 14.9
Las Venturas Airport: 1730.0, 1610.0, 10.8
Mount Chiliad Peak: -2345.0, -1557.0, 484.0
Las Venturas Strip: 2025.0, 1008.0, 10.8
Vinewood (LS): 280.0, -1650.0, 40.0
Madd Dogg Mansion: 1264.0, -793.0, 96.0
Police Impound (LS): 247.0, -1584.0, 17.0
Hospital (LS): 1183.0, -1355.0, 14.0
Jetpack Spawn: 481.0, -1425.0, 30.0
Area 51: 214.0, 1870.0, 17.0
\`\`\``,
  },
  // ─── Default fallback ───
];

export function getSAMPAnswer(question: string): string {
  const q = question.toLowerCase().trim();

  for (const entry of sampKnowledge) {
    for (const pattern of entry.patterns) {
      if (q.includes(pattern.toLowerCase())) {
        return entry.answer;
      }
    }
  }

  // Fallback generic responses
  if (q.includes('چطور') || q.includes('چگونه') || q.includes('how')) {
    return `برای این سوال اطلاعات خاصی ندارم، اما می‌توانید از منابع زیر استفاده کنید:

🔹 **ویکی SA-MP**: sampwiki.net
🔹 **Forums**: forum.sa-mp.com
🔹 **open.mp Docs**: open.mp/docs
🔹 **Pawn Reference**: wiki.sa-mp.com/wiki/Category:Scripting_Functions

سوال خود را بیشتر توضیح دهید تا بهتر کمک کنم.`;
  }

  if (q.includes('خطا') || q.includes('error') || q.includes('مشکل') || q.includes('bug')) {
    return `برای رفع خطا، لطفاً موارد زیر را بررسی کنید:

1. **کد خطا را دقیق بنویسید** — error/warning + شماره
2. **بخش مربوطه کد** را نشان دهید
3. **include‌های** استفاده شده را ذکر کنید

**منابع رفع خطا:**
- پیام خطای کامپایلر را در SA-MP Wiki جستجو کنید
- در forums.sa-mp.com پست بگذارید`;
  }

  return `سوال جالبیه! متأسفانه در پایگاه دانش من اطلاعات مستقیمی برای این سوال نیست.

💡 **پیشنهادها:**
- سوال را به انگلیسی در **sa-mp.mp/forums** بپرسید
- ویکی **open.mp/docs/scripting** را بررسی کنید
- در گروه‌های تلگرام SAMP فارسی بپرسید

اگر سوال دیگری درباره Pawn، پلاگین‌ها، vehicle/weapon IDs، یا تنظیمات سرور دارید، من اینجام! 🎮`;
}
