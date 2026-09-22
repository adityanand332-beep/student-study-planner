const taskForm=document.getElementById('taskForm');
const taskName=document.getElementById('taskName');
const subject=document.getElementById('subject');
const taskDate=document.getElementById('taskDate');
const priority=document.getElementById('priority');
const taskList=document.getElementById('taskList');
const emptyState=document.getElementById('emptyState');
const filter=document.getElementById('filter');
const search=document.getElementById('search');
const clearAll=document.getElementById('clearAll');

let tasks=JSON.parse(localStorage.getItem('studyPlannerTasks')||'[]');

const today=new Date();
document.getElementById('today').textContent=today.toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'});
taskDate.value=today.toISOString().split('T')[0];

function save(){localStorage.setItem('studyPlannerTasks',JSON.stringify(tasks));}

function render(){
  const q=search.value.toLowerCase().trim();
  const mode=filter.value;
  const visible=tasks.filter(t=>{
    const status=mode==='all'||(mode==='completed'&&t.done)||(mode==='pending'&&!t.done);
    const text=(t.name+' '+t.subject).toLowerCase().includes(q);
    return status&&text;
  });
  taskList.innerHTML='';
  emptyState.style.display=visible.length?'none':'block';

  visible.forEach(t=>{
    const el=document.createElement('div');
    el.className='task '+(t.done?'done':'');
    el.innerHTML=`
      <input class="check" type="checkbox" ${t.done?'checked':''} aria-label="Complete task">
      <div class="task-main">
        <h3>${escapeHTML(t.name)}</h3>
        <div class="meta">
          <span class="badge">${escapeHTML(t.subject)}</span>
          <span class="badge ${t.priority.toLowerCase()}">${t.priority}</span>
          <span>📅 ${formatDate(t.date)}</span>
        </div>
      </div>
      <button class="delete" type="button">Delete</button>`;
    el.querySelector('.check').addEventListener('change',()=>{
      t.done=!t.done;save();render();
    });
    el.querySelector('.delete').addEventListener('click',()=>{
      tasks=tasks.filter(x=>x.id!==t.id);save();render();
    });
    taskList.appendChild(el);
  });

  const total=tasks.length, completed=tasks.filter(t=>t.done).length;
  const pending=total-completed, pct=total?Math.round(completed/total*100):0;
  document.getElementById('totalTasks').textContent=total;
  document.getElementById('completedTasks').textContent=completed;
  document.getElementById('pendingTasks').textContent=pending;
  document.getElementById('progressText').textContent=pct+'%';
  document.getElementById('progressPercent').textContent=pct+'%';
  document.getElementById('progressBar').style.width=pct+'%';
  document.getElementById('taskCount').textContent=`${visible.length} task${visible.length===1?'':'s'}`;
}

function formatDate(value){
  if(!value)return 'No date';
  return new Date(value+'T00:00:00').toLocaleDateString('en-IN',{day:'2-digit',month:'short',year:'numeric'});
}
function escapeHTML(str){
  return str.replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]));
}

taskForm.addEventListener('submit',e=>{
  e.preventDefault();
  tasks.unshift({id:Date.now(),name:taskName.value.trim(),subject:subject.value,date:taskDate.value,priority:priority.value,done:false});
  save();taskForm.reset();taskDate.value=today.toISOString().split('T')[0];priority.value='Medium';render();taskName.focus();
});
filter.addEventListener('change',render);
search.addEventListener('input',render);
clearAll.addEventListener('click',()=>{
  if(tasks.length && confirm('Delete all study tasks?')){tasks=[];save();render();}
});
render();
