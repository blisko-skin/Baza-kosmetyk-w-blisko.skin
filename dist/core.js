export const key = 'blisko.skin.prototype.v1';
export const dbName = 'blisko-skin';
export const roles = ['Bazowe', 'Ukierunkowane na problem', 'Wspomagające'];
export const statuses = ['Nie oceniono', 'Ulubieniec blisko.skin', 'Sprawdzony', 'Warty przetestowania', 'Warunkowy', 'Odrzucony'];
export const facets = {
  skinTypes: ['Sucha', 'Normalna', 'Mieszana', 'Tłusta'],
  needs: ['Zaskórniki otwarte', 'Zaskórniki zamknięte', 'Trądzik / zmiany zapalne', 'Odwodnienie', 'Zaburzona bariera naskórkowa', 'Nadmierne wydzielanie sebum', 'Przebarwienia', 'Nierówny koloryt', 'Rumień / skłonność do zaczerwienień', 'Skóra wrażliwa'],
  fragrance: ['Bez dodanej kompozycji zapachowej', 'Zawiera kompozycję zapachową', 'Zawiera olejki lub substancje aromatyczne'],
  textures: ['Wodnista', 'Płynna', 'Żelowa', 'Żelowo-kremowa', 'Emulsyjna', 'Kremowa', 'Bogata', 'Olejowa'],
  cautions: ['Ryzyko przesuszenia lub uczucia ściągnięcia', 'Aktywne podrażnienie lub naruszona bariera', 'Aktywne AZS lub egzema', 'Ciąża — wymaga sprawdzenia konkretnego produktu', 'Karmienie piersią — wymaga sprawdzenia konkretnego produktu', 'Bezpośrednio po zabiegu naruszającym barierę', 'Po mezoterapii mikroigłowej — zgodnie z zaleceniem osoby wykonującej zabieg', 'Po peelingu chemicznym lub laserze — zgodnie z zaleceniem osoby wykonującej zabieg']
};
export const facetLabels = {skinTypes:'Typ cery', needs:'Problem lub potrzeba', fragrance:'Zapach', textures:'Konsystencja', cautions:'Ostrożność'};
export const budgetBands = [
  {id:'up25', label:'Do 25 zł', max:25},
  {id:'up50', label:'Do 50 zł', max:50},
  {id:'up100', label:'Do 100 zł', max:100},
  {id:'over100', label:'Powyżej 100 zł', min:100.01}
];
export const profileDefaults = () => ({skinTypes:[], needs:[], fragrance:[], textures:[], cautions:[], notFor:'', recommendationNote:''});
export const modules = [
  {id:'inci',name:'Skład i formulacja',desc:'INCI, wersje analizy i źródła.',field:'inci',label:'INCI / notatka robocza'},
  {id:'skin',name:'Dopasowanie do skóry',desc:'Rodzaje, potrzeby skóry i uzasadnienie.',field:'skin',label:'Dopasowanie i uzasadnienie'},
  {id:'sensory',name:'Właściwości sensoryczne',desc:'Konsystencja, wykończenie i źródło obserwacji.',field:'sensory',label:'Obserwacje sensoryczne — podaj źródło'},
  {id:'notes',name:'Moje obserwacje',desc:'Twoje doświadczenia, oddzielone od analizy.',field:'notes',label:'Moje obserwacje'}
];

export function seed(){
  const demo = [
    ['Delikatna emulsja myjąca','Oczyszczanie',0,'#e6e4d8','Gliceryna · łagodne oczyszczanie'],
    ['Serum nawilżające','Serum',0,'#e8ded6','Humektanty · nawilżenie'],
    ['Krem wspierający barierę','Krem',0,'#e2e5d9','Lipidy · wsparcie bariery'],
    ['Koncentrat złuszczający','Peeling',1,'#e9dddf','Kwasy · złuszczanie'],
    ['Emulsja kojąca','Emulsja',2,'#eee2d6','Pielęgnacja wspomagająca'],
    ['Krem ochronny na dzień','Ochrona',0,'#e6e3d9','Ochrona · pielęgnacja dzienna']
  ];
  return {schemaVersion:2,enabled:modules.map(m=>m.id),products:demo.map((p,i)=>({id:'demo-'+i,brand:'BIBLIOTEKA DEMO',name:p[0],category:p[1],role:roles[p[2]],tone:p[3],actives:p[4],status:'Nie oceniono',demo:true,volume:'',unit:'ml',price:'',priceCheckedAt:'',updatedAt:new Date().toISOString(),data:{},profile:profileDefaults()}))};
}

export function migrateState(s){
  if(!s||!Array.isArray(s.products)) throw Error('Nieprawidłowa lub nieobsługiwana kopia blisko.skin.');
  if(s.schemaVersion===1){s={...s,schemaVersion:2,products:s.products.map(p=>({...p,profile:{...profileDefaults(),...(p.profile||{})}}))};}
  if(s.schemaVersion===2){s={...s,products:s.products.map(p=>({...p,profile:{...profileDefaults(),...(p.profile||{})}}))};}
  return validateState(s);
}

export function validateState(s){
  if(!s||s.schemaVersion!==2||!Array.isArray(s.products)||!Array.isArray(s.enabled)) throw Error('Nieprawidłowa lub nieobsługiwana kopia blisko.skin.');
  const ids=new Set();
  for(const p of s.products){
    if(!p||typeof p.id!=='string'||ids.has(p.id)||typeof p.name!=='string'||!p.name.trim()||typeof p.brand!=='string'||!p.brand.trim()||typeof p.category!=='string'||!roles.includes(p.role)||!statuses.includes(p.status)) throw Error('Kopia zawiera nieprawidłowy produkt.');
    if(p.photoDataUrl&&(!/^data:image\/(png|jpeg|webp);base64,[A-Za-z0-9+/]+={0,2}$/i.test(p.photoDataUrl)||p.photoDataUrl.length>4_200_000)) throw Error('Kopia zawiera zdjęcie w nieobsługiwanym formacie lub zbyt duże.');
    const profile=p.profile||profileDefaults();
    for(const group of Object.keys(facets)) if(!Array.isArray(profile[group])||profile[group].some(v=>!facets[group].includes(v))) throw Error('Produkt zawiera nieprawidłowe oznaczenia do filtrowania.');
    if(typeof profile.notFor!=='string'||typeof profile.recommendationNote!=='string') throw Error('Kopia zawiera nieprawidłowe informacje o rekomendacji.');
    ids.add(p.id);
  }
  if(new Set(s.enabled).size!==s.enabled.length||!s.enabled.every(id=>modules.some(m=>m.id===id))) throw Error('Kopia zawiera nieznany moduł.');
  return s;
}

function openDb(){return new Promise((resolve,reject)=>{const req=indexedDB.open(dbName,1);req.onupgradeneeded=()=>req.result.createObjectStore('appState',{keyPath:'id'});req.onsuccess=()=>resolve(req.result);req.onerror=()=>reject(req.error||Error('Nie udało się otworzyć bazy'))})}
async function readDb(db){return new Promise((resolve,reject)=>{const tx=db.transaction('appState','readonly'),req=tx.objectStore('appState').get('main');req.onsuccess=()=>resolve(req.result?.state||null);req.onerror=()=>reject(req.error||Error('Nie udało się odczytać bazy'))})}
async function writeDb(db,state){return new Promise((resolve,reject)=>{const tx=db.transaction('appState','readwrite');tx.objectStore('appState').put({id:'main',state});tx.oncomplete=()=>resolve();tx.onerror=()=>reject(tx.error||Error('Nie udało się zapisać bazy'));tx.onabort=()=>reject(tx.error||Error('Zapis został przerwany'))})}
let db;
export const repository={
  async init(){
    db=await openDb();let data=await readDb(db);
    if(data){data=migrateState(data);await writeDb(db,data);return data;}
    let old=null;try{old=localStorage.getItem(key)}catch{}
    if(old){data=migrateState(JSON.parse(old));await writeDb(db,data);return data;}
    data=seed();await writeDb(db,data);return data;
  },
  async save(state){validateState(state);if(!db)throw Error('Baza nie jest gotowa');await writeDb(db,state);},
  async restore(state){state=migrateState(state);if(!db)throw Error('Baza nie jest gotowa');await writeDb(db,state);return state;}
};

export function filtered(products,{q='',role='',sort='name',criteria={}}){
  return products.filter(p=>{
    if(role&&p.role!==role)return false;
    if(![p.name,p.brand,p.category,p.actives].join(' ').toLocaleLowerCase('pl').includes(q.toLocaleLowerCase('pl')))return false;
    const profile=p.profile||profileDefaults();
    for(const [group,selected] of Object.entries(criteria)){
      if(!selected?.length)continue;
      if(group==='budget'){
        if(p.price==null||String(p.price).trim()===''||!p.priceCheckedAt)return false;
        const price=Number(p.price);if(!Number.isFinite(price)||!selected.some(id=>{const band=budgetBands.find(b=>b.id===id);return band&&price<=(band.max??Infinity)&&price>=(band.min??0)}))return false;
      } else if(group==='cautions'){
        if(!selected.some(tag=>profile.cautions.includes(tag)||profile.notFor.toLocaleLowerCase('pl').includes(tag.toLocaleLowerCase('pl'))))return false;
      } else if(!selected.some(tag=>(profile[group]||[]).includes(tag)))return false;
    }
    return true;
  }).sort((a,b)=>sort==='recent'?b.updatedAt.localeCompare(a.updatedAt):a.name.localeCompare(b.name,'pl'));
}
