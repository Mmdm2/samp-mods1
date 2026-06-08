import { useState } from 'react';
import { Code2, Download, Save, Trash2, ChevronDown, Zap, Copy, Check } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

type ScriptType = 'pawn' | 'lua' | 'cs' | 'dat' | 'sf' | 'cleo';

interface Template {
  name: string;
  type: ScriptType;
  ext: string;
  description: string;
  code: string;
}

const templates: Template[] = [
  {
    name: 'GameMode پایه',
    type: 'pawn',
    ext: 'pwn',
    description: 'GameMode ساده SA-MP',
    code: `#include <a_samp>

#define MAX_PLAYERS 100
#define SERVER_NAME "My SA-MP Server"
#define SERVER_COLOR 0xFF8C00FF

public OnGameModeInit() {
    SetGameModeText(SERVER_NAME);
    AddPlayerClass(0, 2495.0, -1688.0, 13.3, 180.0, 0, 0, 0, 0, 0, 0);
    print("[GameMode] Started!");
    return 1;
}

public OnGameModeExit() {
    print("[GameMode] Stopped!");
    return 1;
}

public OnPlayerConnect(playerid) {
    new name[MAX_PLAYER_NAME];
    GetPlayerName(playerid, name, sizeof(name));
    new msg[64];
    format(msg, sizeof(msg), "[سرور] %s وارد شد!", name);
    SendClientMessageToAll(SERVER_COLOR, msg);
    return 1;
}

public OnPlayerDisconnect(playerid, reason) {
    new name[MAX_PLAYER_NAME];
    GetPlayerName(playerid, name, sizeof(name));
    new msg[64];
    format(msg, sizeof(msg), "[سرور] %s خارج شد", name);
    SendClientMessageToAll(0xAAAAAFFF, msg);
    return 1;
}

public OnPlayerSpawn(playerid) {
    GivePlayerWeapon(playerid, 22, 100);
    SetPlayerHealth(playerid, 100.0);
    SetPlayerArmour(playerid, 100.0);
    SendClientMessage(playerid, SERVER_COLOR, "خوش آمدید! استفاده از /help برای دستورات");
    return 1;
}

CMD:help(playerid, params[]) {
    ShowPlayerDialog(playerid, 1, DIALOG_STYLE_MSGBOX, "راهنما",
        "دستورات:\\n/spawn - ریسپاون\\n/veh [id] - ماشین\\n/tp - تله‌پورت",
        "بستن", "");
    return 1;
}

CMD:spawn(playerid, params[]) {
    SpawnPlayer(playerid);
    return 1;
}`,
  },
  {
    name: 'FilterScript VIP',
    type: 'pawn',
    ext: 'pwn',
    description: 'سیستم VIP برای SAMP',
    code: `#include <a_samp>
#include <zcmd>

#define VIP_COLOR 0xFFD700FF
#define ADMIN_COLOR 0xFF4500FF

new bool:gIsVIP[MAX_PLAYERS];

public OnFilterScriptInit() {
    print("[VIP] FilterScript Load شد!");
    return 1;
}

public OnPlayerConnect(playerid) {
    gIsVIP[playerid] = false;
    // بررسی وی‌آی‌پی از دیتابیس
    return 1;
}

CMD:givevip(playerid, params[]) {
    if(!IsPlayerAdmin(playerid)) {
        SendClientMessage(playerid, 0xFF0000FF, "فقط ادمین!");
        return 1;
    }
    new target;
    if(sscanf(params, "i", target)) {
        SendClientMessage(playerid, -1, "/givevip [playerid]");
        return 1;
    }
    gIsVIP[target] = true;
    SendClientMessage(target, VIP_COLOR, "[VIP] شما VIP شدید! 🎖️");
    return 1;
}

CMD:veh(playerid, params[]) {
    if(!gIsVIP[playerid] && !IsPlayerAdmin(playerid)) {
        SendClientMessage(playerid, 0xFF0000FF, "این دستور فقط برای VIP!");
        return 1;
    }
    new model;
    if(sscanf(params, "i", model) || model < 400 || model > 611) {
        SendClientMessage(playerid, -1, "/veh [400-611]");
        return 1;
    }
    new Float:x, Float:y, Float:z, Float:a;
    GetPlayerPos(playerid, x, y, z);
    GetPlayerFacingAngle(playerid, a);
    new v = CreateVehicle(model, x, y+3.0, z, a, -1, -1, -1);
    PutPlayerInVehicle(playerid, v, 0);
    return 1;
}

CMD:heal(playerid, params[]) {
    if(!gIsVIP[playerid]) {
        SendClientMessage(playerid, 0xFF0000FF, "نیاز به VIP!");
        return 1;
    }
    SetPlayerHealth(playerid, 100.0);
    SetPlayerArmour(playerid, 100.0);
    SendClientMessage(playerid, VIP_COLOR, "[VIP] جان و زره پر شد!");
    return 1;
}`,
  },
  {
    name: 'AntiCheat پایه',
    type: 'pawn',
    ext: 'pwn',
    description: 'سیستم آنتی‌چیت ساده',
    code: `#include <a_samp>

#define AC_LOG "[AntiCheat]"
#define MAX_SPEED 2.0
#define MAX_HEALTH 100.0

new Float:gLastHealth[MAX_PLAYERS];
new gKickCount[MAX_PLAYERS];

public OnPlayerUpdate(playerid) {
    // آنتی heli hack / speed hack
    if(IsPlayerInAnyVehicle(playerid)) {
        new vehicleid = GetPlayerVehicleID(playerid);
        new Float:vx, Float:vy, Float:vz;
        GetVehicleVelocity(vehicleid, vx, vy, vz);
        new Float:speed = floatsqroot(vx*vx + vy*vy + vz*vz);

        if(speed > MAX_SPEED + 0.5) {
            gKickCount[playerid]++;
            if(gKickCount[playerid] >= 3) {
                new name[24];
                GetPlayerName(playerid, name, 24);
                printf("%s شناسایی: %s سرعت مشکوک %.2f", AC_LOG, name, speed);
                Kick(playerid);
            }
        }
    }

    // آنتی health hack
    new Float:health;
    GetPlayerHealth(playerid, health);
    if(health > MAX_HEALTH + 1.0 && gLastHealth[playerid] < MAX_HEALTH + 1.0) {
        gKickCount[playerid]++;
        printf("%s هلث هک: %d", AC_LOG, playerid);
        if(gKickCount[playerid] >= 2) Kick(playerid);
    }
    gLastHealth[playerid] = health;
    return 1;
}

public OnPlayerSpawn(playerid) {
    gKickCount[playerid] = 0;
    return 1;
}`,
  },
  {
    name: 'Lua Server Script',
    type: 'lua',
    ext: 'lua',
    description: 'اسکریپت Lua برای MTA:SA',
    code: `-- MTA:SA Server-side Script
-- @XchoR MMD

local playerData = {}

addEventHandler("onPlayerJoin", root, function()
    local player = source
    local name = getPlayerName(player)
    playerData[player] = { money = 0, level = 1, kills = 0 }

    outputChatBox("* " .. name .. " وارد شد!", root, 255, 140, 0, true)
    outputChatBox("خوش آمدید " .. name .. "! از /help استفاده کنید.", player, 255, 140, 0)

    -- دادن اسلحه شروع
    giveWeapon(player, 22, 100) -- Pistol
    giveWeapon(player, 26, 50)  -- Sawnoff
end)

addEventHandler("onPlayerQuit", root, function()
    playerData[source] = nil
end)

addEventHandler("onPlayerDeath", root, function(killer, reason)
    local victim = source
    if killer and isElement(killer) and getElementType(killer) == "player" then
        if playerData[killer] then
            playerData[killer].kills = playerData[killer].kills + 1
            local kills = playerData[killer].kills
            outputChatBox("کشته‌ها: " .. kills, killer, 0, 255, 0)
        end
    end
end)

-- Commands
addCommandHandler("heal", function(player, cmd)
    if getPlayerMoney(player) >= 1000 then
        takePlayerMoney(player, 1000)
        setElementHealth(player, 100)
        outputChatBox("جان پر شد! 1000$ کسر شد.", player, 0, 255, 0)
    else
        outputChatBox("پول کافی ندارید! (1000$)", player, 255, 0, 0)
    end
end)

addCommandHandler("tp", function(player, cmd, x, y, z)
    if not (x and y and z) then
        outputChatBox("/tp [x] [y] [z]", player, 255, 140, 0)
        return
    end
    setElementPosition(player, tonumber(x), tonumber(y), tonumber(z))
    outputChatBox("تله‌پورت شدید!", player, 0, 255, 0)
end)

addCommandHandler("veh", function(player, cmd, model)
    if not model then
        outputChatBox("/veh [model_id]", player, 255, 140, 0)
        return
    end
    local x, y, z = getElementPosition(player)
    local veh = createVehicle(tonumber(model), x+3, y, z)
    warpPedIntoVehicle(player, veh)
    outputChatBox("ماشین اسپاون شد!", player, 0, 255, 0)
end)`,
  },
  {
    name: 'CLEO Script تله‌پورت',
    type: 'cs',
    ext: 'cs',
    description: 'CLEO CS اسکریپت تله‌پورت',
    code: `// CLEO Script - Teleport Menu
// @XchoR MMD
// فایل را در پوشه CLEO قرار دهید

{$CLEO .cs}
thread 'TP_MENU'
0001: wait 0

:MAIN_LOOP
0001: wait 100 ms
00D6: if
0AB0: key_pressed 120  // F9 = 120
004D: jump_if_false @MAIN_LOOP

// نمایش منو
0001: wait 0
// تله‌پورت به Grove Street
0174: set_player 0 pos 2495.0 -1688.0 13.3
009A: create_marker_at 2495.0 -1688.0 13.3 type 0 color 3 handle_store_to 1@
01E3: show_text_1number 'GOHERE' 2000 ms 1

jump @MAIN_LOOP`,
  },
  {
    name: 'server.cfg نمونه',
    type: 'dat',
    ext: 'cfg',
    description: 'تنظیمات سرور SA-MP',
    code: `echo Executing Server Config...

lanmode 0
rcon_password YourRconPassword123
maxplayers 100
port 7777
hostname My Awesome SA-MP Server
gamemode0 my_gamemode 1
filterscripts anticheat vip admin

announce 1
chatlogging 1
onfoot_rate 40
incar_rate 40
weapon_rate 40
stream_distance 300.0
stream_rate 1000
maxnpc 0
logtimeformat [%H:%M:%S]
language Farsi/English
mapname San Andreas
weburl www.my-server.com

// بندهای امنیتی
bind 0.0.0.0`,
  },
];

function downloadFile(content: string, filename: string) {
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export default function ScriptBuilder() {
  const [selected, setSelected] = useState<Template>(templates[0]);
  const [code, setCode] = useState(templates[0].code);
  const [title, setTitle] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const { user } = useAuth();

  function selectTemplate(t: Template) {
    setSelected(t);
    setCode(t.code);
    setShowTemplates(false);
  }

  async function saveScript() {
    if (!user) return;
    setSaving(true);
    await supabase.from('scripts').insert({
      title: title || selected.name,
      script_type: selected.ext,
      content: code,
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  function copyCode() {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const typeColors: Record<string, string> = {
    pawn: 'text-blue-400',
    lua: 'text-green-400',
    cs: 'text-yellow-400',
    dat: 'text-purple-400',
    sf: 'text-pink-400',
    cleo: 'text-red-400',
  };

  return (
    <div className="space-y-5">
      {/* Template selector */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-rajdhani font-bold text-orange-500 flex items-center gap-2">
            <Code2 size={16} /> قالب‌های آماده
          </h3>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {templates.map(t => (
            <button
              key={t.name}
              onClick={() => selectTemplate(t)}
              className={`p-3 rounded-lg text-left border transition-all duration-200 ${
                selected.name === t.name
                  ? 'bg-orange-500/15 border-orange-500/40 text-white'
                  : 'bg-dark-300 border-dark-50 text-gray-400 hover:border-orange-500/30 hover:text-white'
              }`}
            >
              <span className={`text-[10px] font-rajdhani font-bold uppercase tracking-wider ${typeColors[t.type] || 'text-gray-400'}`}>
                .{t.ext}
              </span>
              <p className="text-xs font-rajdhani font-semibold mt-1 leading-tight">{t.name}</p>
              <p className="text-[10px] text-gray-600 mt-0.5 font-rajdhani">{t.description}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Editor */}
      <div className="card space-y-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex-1 min-w-0">
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder={selected.name}
              className="input-dark text-sm"
            />
          </div>
          <div className="badge-orange">
            <Code2 size={10} />
            .{selected.ext}
          </div>
        </div>

        {/* Code editor */}
        <div className="relative">
          <div className="absolute top-3 left-3 right-3 flex items-center justify-between z-10">
            <div className="flex gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-red-500/60" />
              <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/60" />
              <div className="w-2.5 h-2.5 rounded-full bg-green-500/60" />
            </div>
            <span className={`text-[10px] font-rajdhani ${typeColors[selected.type] || ''}`}>
              {selected.name}.{selected.ext}
            </span>
          </div>
          <textarea
            value={code}
            onChange={e => setCode(e.target.value)}
            className="w-full h-80 bg-dark-500 border border-dark-50 rounded-xl pt-10 px-4 pb-4 font-mono text-xs text-green-400 focus:outline-none focus:border-orange-500/50 resize-none leading-relaxed"
            dir="ltr"
            spellCheck={false}
          />
        </div>

        {/* Actions */}
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => downloadFile(code, `${title || selected.name}.${selected.ext}`)}
            className="btn-orange flex items-center gap-2"
          >
            <Download size={15} /> دانلود .{selected.ext}
          </button>
          <button
            onClick={copyCode}
            className="btn-outline flex items-center gap-2"
          >
            {copied ? <Check size={15} className="text-green-400" /> : <Copy size={15} />}
            {copied ? 'کپی شد!' : 'کپی کد'}
          </button>
          {user && (
            <button
              onClick={saveScript}
              disabled={saving}
              className="btn-outline flex items-center gap-2"
            >
              {saving ? (
                <div className="w-4 h-4 border-2 border-orange-500/30 border-t-orange-500 rounded-full animate-spin" />
              ) : saved ? (
                <Check size={15} className="text-green-400" />
              ) : (
                <Save size={15} />
              )}
              {saved ? 'ذخیره شد!' : 'ذخیره'}
            </button>
          )}
          <button
            onClick={() => setCode(selected.code)}
            className="flex items-center gap-2 px-4 py-2.5 text-sm font-rajdhani font-bold text-gray-400 hover:text-red-400 border border-dark-50 hover:border-red-500/30 rounded-lg transition-colors uppercase tracking-wide"
          >
            <Trash2 size={15} /> ریست
          </button>
        </div>
      </div>

      {/* Cheat Script Generator */}
      <div className="card border-orange-500/20">
        <h3 className="font-rajdhani font-bold text-orange-500 flex items-center gap-2 mb-4">
          <Zap size={16} /> تولیدکننده سریع اسکریپت
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[
            { label: 'سیستم گفتگو (Chat System)', type: 'chat' },
            { label: 'سیستم VIP', type: 'vip' },
            { label: 'آنتی‌چیت', type: 'anticheat' },
            { label: 'سیستم ادمین', type: 'admin' },
            { label: 'سیستم دوئل', type: 'duel' },
            { label: 'سیستم گنگ', type: 'gang' },
          ].map(({ label, type }) => (
            <button
              key={type}
              onClick={() => {
                const snippets: Record<string, string> = {
                  chat: `CMD:me(playerid, params[]) {\n    new msg[128], name[24];\n    if(!strlen(params)) return SendClientMessage(playerid, -1, "/me [action]"), 1;\n    GetPlayerName(playerid, name, 24);\n    format(msg, 128, "* %s %s", name, params);\n    SendClientMessageToAll(0xC2A2DAFF, msg);\n    return 1;\n}`,
                  vip: templates[1].code,
                  anticheat: templates[2].code,
                  admin: `CMD:kick(playerid, params[]) {\n    if(!IsPlayerAdmin(playerid)) return 0;\n    new target, reason[64];\n    if(sscanf(params, "is[64]", target, reason)) return SendClientMessage(playerid, -1, "/kick [id] [reason]"), 1;\n    Kick(target);\n    return 1;\n}`,
                  duel: `// سیستم دوئل\nnew bool:gInDuel[MAX_PLAYERS];\nnew gDuelOpponent[MAX_PLAYERS];\n\nCMD:duel(playerid, params[]) {\n    new target;\n    if(sscanf(params, "i", target)) return SendClientMessage(playerid, -1, "/duel [playerid]"), 1;\n    if(gInDuel[target]) return SendClientMessage(playerid, -1, "این بازیکن در دوئل است"), 1;\n    gInDuel[playerid] = true;\n    gInDuel[target] = true;\n    gDuelOpponent[playerid] = target;\n    gDuelOpponent[target] = playerid;\n    SendClientMessage(playerid, 0xFF8C00FF, "دوئل شروع شد!");\n    SendClientMessage(target, 0xFF8C00FF, "به دوئل دعوت شدید!");\n    return 1;\n}`,
                  gang: `// سیستم گنگ\n#define MAX_GANGS 10\nnew gPlayerGang[MAX_PLAYERS];\nnew gGangName[MAX_GANGS][24];\nnew gGangLeader[MAX_GANGS];\n\nCMD:creategang(playerid, params[]) {\n    new name[24];\n    if(sscanf(params, "s[24]", name)) return SendClientMessage(playerid, -1, "/creategang [name]"), 1;\n    // ایجاد گنگ جدید...\n    SendClientMessage(playerid, 0xFF8C00FF, "گنگ ایجاد شد!");\n    return 1;\n}`,
                };
                setCode(snippets[type] || '// کد اینجا');
                setTitle(label);
              }}
              className="flex items-center gap-2 p-3 bg-dark-300 border border-dark-50 rounded-lg text-gray-400 hover:text-orange-400 hover:border-orange-500/30 transition-all text-sm font-rajdhani"
            >
              <Code2 size={14} className="text-orange-500" />
              {label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
