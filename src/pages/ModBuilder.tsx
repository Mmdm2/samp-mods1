import { useState, useEffect } from 'react';
import { Wrench, Plus, Download, Edit3, Trash2, Package, FolderOpen, FileText, CheckCircle, Save } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

interface ProjectFile {
  name: string;
  type: string;
  size: string;
  added: string;
}

interface Project {
  id: string;
  name: string;
  description: string;
  project_type: string;
  files: ProjectFile[];
  created_at: string;
}

const PROJECT_TYPES = [
  { val: 'pack', label: 'پک (Pack)', icon: '📦' },
  { val: 'isborca', label: 'ایسبورکا (Isborca)', icon: '🏗️' },
  { val: 'mod', label: 'مود (Mod)', icon: '🔧' },
  { val: 'script', label: 'اسکریپت (Script)', icon: '💻' },
  { val: 'skin', label: 'اسکین (Skin)', icon: '👕' },
  { val: 'vehicle', label: 'ماشین (Vehicle)', icon: '🚗' },
  { val: 'map', label: 'نقشه (Map)', icon: '🗺️' },
];

const FILE_TYPES_SAMP = ['.pwn', '.amx', '.lua', '.cs', '.txd', '.dff', '.col', '.ipl', '.dat', '.ini', '.cfg', '.wav', '.mp3', '.png', '.jpg'];

export default function ModBuilder() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ name: '', description: '', project_type: 'pack' });
  const [activeProject, setActiveProject] = useState<Project | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [addingFile, setAddingFile] = useState(false);
  const [newFile, setNewFile] = useState({ name: '', type: '.pwn' });
  const { user } = useAuth();

  useEffect(() => {
    if (user) loadProjects();
  }, [user]);

  async function loadProjects() {
    const { data } = await supabase.from('projects').select('*').order('created_at', { ascending: false });
    if (data) setProjects(data);
  }

  async function createProject() {
    if (!form.name.trim()) return;
    setSaving(true);
    const { data } = await supabase.from('projects').insert({
      name: form.name,
      description: form.description,
      project_type: form.project_type,
      files: [],
    }).select().single();
    if (data) {
      setProjects(prev => [data, ...prev]);
      setActiveProject(data);
      setCreating(false);
      setForm({ name: '', description: '', project_type: 'pack' });
    }
    setSaving(false);
  }

  async function addFileToProject() {
    if (!activeProject || !newFile.name.trim()) return;
    const file: ProjectFile = {
      name: newFile.name + (newFile.name.endsWith(newFile.type) ? '' : newFile.type),
      type: newFile.type,
      size: '0 KB',
      added: new Date().toISOString(),
    };
    const updated = [...(activeProject.files || []), file];
    await supabase.from('projects').update({ files: updated }).eq('id', activeProject.id);
    const updatedProject = { ...activeProject, files: updated };
    setActiveProject(updatedProject);
    setProjects(prev => prev.map(p => p.id === activeProject.id ? updatedProject : p));
    setAddingFile(false);
    setNewFile({ name: '', type: '.pwn' });
  }

  async function removeFile(index: number) {
    if (!activeProject) return;
    const updated = activeProject.files.filter((_, i) => i !== index);
    await supabase.from('projects').update({ files: updated }).eq('id', activeProject.id);
    const updatedProject = { ...activeProject, files: updated };
    setActiveProject(updatedProject);
    setProjects(prev => prev.map(p => p.id === activeProject.id ? updatedProject : p));
  }

  async function deleteProject(id: string) {
    await supabase.from('projects').delete().eq('id', id);
    setProjects(prev => prev.filter(p => p.id !== id));
    if (activeProject?.id === id) setActiveProject(null);
  }

  function exportProject() {
    if (!activeProject) return;
    const content = JSON.stringify(activeProject, null, 2);
    const blob = new Blob([content], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${activeProject.name}_project.json`;
    a.click();
  }

  const typeInfo = (type: string) => PROJECT_TYPES.find(t => t.val === type) || PROJECT_TYPES[0];

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Sidebar */}
        <div className="space-y-4">
          {/* Create */}
          {!creating ? (
            <button
              onClick={() => setCreating(true)}
              className="btn-orange w-full flex items-center justify-center gap-2"
            >
              <Plus size={15} /> پروژه جدید
            </button>
          ) : (
            <div className="card space-y-3">
              <h3 className="font-rajdhani font-bold text-orange-500 text-sm">پروژه جدید</h3>
              <input
                type="text"
                value={form.name}
                onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                placeholder="نام پروژه..."
                className="input-dark text-sm"
              />
              <textarea
                value={form.description}
                onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                placeholder="توضیحات (اختیاری)..."
                className="input-dark text-sm resize-none h-16"
              />
              <select
                value={form.project_type}
                onChange={e => setForm(p => ({ ...p, project_type: e.target.value }))}
                className="input-dark text-sm"
              >
                {PROJECT_TYPES.map(t => (
                  <option key={t.val} value={t.val}>{t.icon} {t.label}</option>
                ))}
              </select>
              <div className="flex gap-2">
                <button onClick={createProject} disabled={saving} className="btn-orange flex-1 flex items-center justify-center gap-1.5 text-sm">
                  {saving ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><Save size={13} /> ساخت</>}
                </button>
                <button onClick={() => setCreating(false)} className="btn-outline px-3 text-sm">لغو</button>
              </div>
            </div>
          )}

          {/* Projects list */}
          <div className="space-y-2">
            <p className="text-xs text-gray-500 font-rajdhani px-1">پروژه‌های شما ({projects.length})</p>
            {projects.length === 0 ? (
              <div className="card text-center py-8">
                <FolderOpen size={28} className="text-gray-700 mx-auto mb-2" />
                <p className="text-xs text-gray-500 font-rajdhani">پروژه‌ای وجود ندارد</p>
              </div>
            ) : (
              projects.map(p => (
                <div
                  key={p.id}
                  onClick={() => setActiveProject(p)}
                  className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${activeProject?.id === p.id ? 'bg-orange-500/10 border-orange-500/30' : 'bg-dark-300 border-dark-50 hover:border-orange-500/20'}`}
                >
                  <span className="text-lg">{typeInfo(p.project_type).icon}</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-rajdhani font-bold text-sm text-white truncate">{p.name}</p>
                    <p className="text-[10px] text-gray-500 font-rajdhani">{(p.files || []).length} فایل • {typeInfo(p.project_type).label}</p>
                  </div>
                  <button
                    onClick={e => { e.stopPropagation(); deleteProject(p.id); }}
                    className="p-1.5 text-gray-600 hover:text-red-400 transition-colors"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Project Detail */}
        <div className="lg:col-span-2">
          {!activeProject ? (
            <div className="card flex flex-col items-center justify-center py-20 text-center h-full">
              <Wrench size={40} className="text-gray-700 mb-4" />
              <p className="font-rajdhani font-bold text-gray-500 text-lg">پروژه‌ای انتخاب نشده</p>
              <p className="text-xs text-gray-600 mt-1 font-rajdhani">یک پروژه انتخاب کنید یا پروژه جدید بسازید</p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Project header */}
              <div className="card">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{typeInfo(activeProject.project_type).icon}</span>
                    <div>
                      <h2 className="font-rajdhani font-bold text-xl text-white">{activeProject.name}</h2>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="badge-orange">{typeInfo(activeProject.project_type).label}</span>
                        <span className="text-xs text-gray-500 font-rajdhani">{(activeProject.files || []).length} فایل</span>
                      </div>
                    </div>
                  </div>
                  <button onClick={exportProject} className="btn-outline flex items-center gap-1.5 text-sm">
                    <Download size={13} /> خروجی JSON
                  </button>
                </div>
                {activeProject.description && (
                  <p className="mt-3 text-sm text-gray-400 font-rajdhani">{activeProject.description}</p>
                )}
              </div>

              {/* File list */}
              <div className="card">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-rajdhani font-bold text-orange-500 flex items-center gap-2">
                    <FileText size={16} /> فایل‌های پروژه
                  </h3>
                  <button
                    onClick={() => setAddingFile(a => !a)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-orange-500/10 border border-orange-500/20 text-orange-400 rounded-lg hover:bg-orange-500/20 transition-all text-xs font-rajdhani font-bold"
                  >
                    <Plus size={12} /> افزودن فایل
                  </button>
                </div>

                {addingFile && (
                  <div className="flex gap-2 mb-4 p-3 bg-dark-300 rounded-lg">
                    <input
                      type="text"
                      value={newFile.name}
                      onChange={e => setNewFile(p => ({ ...p, name: e.target.value }))}
                      placeholder="نام فایل..."
                      className="input-dark flex-1 text-sm"
                      dir="ltr"
                    />
                    <select
                      value={newFile.type}
                      onChange={e => setNewFile(p => ({ ...p, type: e.target.value }))}
                      className="input-dark w-24 text-sm"
                    >
                      {FILE_TYPES_SAMP.map(t => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                    <button onClick={addFileToProject} className="btn-orange px-3 text-sm">افزودن</button>
                  </div>
                )}

                {(activeProject.files || []).length === 0 ? (
                  <div className="text-center py-8">
                    <Package size={24} className="text-gray-700 mx-auto mb-2" />
                    <p className="text-xs text-gray-500 font-rajdhani">فایلی اضافه نشده</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {activeProject.files.map((f, i) => (
                      <div key={i} className="flex items-center gap-3 p-2.5 bg-dark-300 border border-dark-50 rounded-lg">
                        <div className="w-8 h-8 rounded-lg bg-dark-400 border border-dark-50 flex items-center justify-center">
                          <FileText size={14} className="text-orange-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-mono text-sm text-white truncate">{f.name}</p>
                          <p className="text-[10px] text-gray-500 font-rajdhani">{f.type} • {f.size}</p>
                        </div>
                        <CheckCircle size={14} className="text-green-400 shrink-0" />
                        <button onClick={() => removeFile(i)} className="p-1 text-gray-600 hover:text-red-400 transition-colors">
                          <Trash2 size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* File type guide */}
              <div className="card">
                <h4 className="font-rajdhani font-bold text-gray-400 text-sm mb-3">راهنمای فایل‌های SA-MP</h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {[
                    { ext: '.pwn', desc: 'سورس اسکریپت Pawn' },
                    { ext: '.amx', desc: 'اسکریپت کامپایل شده' },
                    { ext: '.txd', desc: 'مجموعه تکسچر' },
                    { ext: '.dff', desc: 'مدل 3D' },
                    { ext: '.col', desc: 'Collision Data' },
                    { ext: '.cs', desc: 'CLEO Script' },
                  ].map(({ ext, desc }) => (
                    <div key={ext} className="flex gap-2 items-center p-2 bg-dark-300 rounded-lg">
                      <span className="font-mono text-[11px] text-orange-400 w-10">{ext}</span>
                      <span className="text-[10px] text-gray-500 font-rajdhani">{desc}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
