class dataset {
  __data__={};
  __actions__ = {};
  handler = this.proxyHandler();
  __data__ = new Proxy(this.__data__,this.handler);
  setData(prop,val){
    this.__data__[prop] = val;
  }
  getData(prop){
    return this.__data__[prop];
  }
  watch(prop,action=()=>{}){
    this.__actions__[prop] = action;
  }
  proxyHandler(){
    var that = this;
    return {
      set(target, prop, val) {
        target[prop] = val;
        that.__actions__[prop]? that.__actions__[prop](val) : '';
        return true;
      },
      get(t, p, r) {
        return t[p];
      }
    }
  }
}


const print =(e)=>console.log(e);
customElements.define('only-if',class main extends HTMLElement {constructor(){super();let _bool_ = eval(this.dataset.if);if(!_bool_){this.remove();console.log(_bool_);}}});

customElements.define('a-var',
class main extends HTMLElement {
  constructor(){
    super();
    this.setupDataset();
    this.init = this.innerText;
    this.innerText='';
    let isMany = this.init.includes(',');
    //print('is more than 1 : '+isMany);
    if (isMany){
      this.parts=this.init.split(',');
      let len = this.parts.length;
      
      for(let i=0;i<this.parts.length;i++){
        let prop=this.parts[i];
        if(this.parts[i].includes('=')){
          let subparts = this.parts[i].split('=');
          this._data_.setData(subparts[0],eval(subparts[1]));
          prop = subparts[0];
        }
        let span = document.createElement('span');
        this.appendChild(span);
        this._data_.watch(prop,(e)=>{
          let sep = this.getAttribute('separator');
          sep = (i+1)<len?sep:'';
          span.innerText = e+sep;
        });
        let tmp = this._data_.getData(prop);
        this._data_.setData(prop,'');
        this._data_.setData(prop,tmp);
        tmp = null;
      }
      //print(this._data_);
    } else {
      this.defaultAction();
      //this.checkVal();
    }
  }
  defaultAction(){
    if(this.init.includes('=')){
      let [prop,val] = [this.init.split('=')[0],eval(this.init.split('=')[1])];
      this._data_.setData(prop,val);
      this._data_.watch(prop,()=>this.innerText=this._data_.getData(prop));
      let tmp = this._data_.getData(prop);
      this._data_.setData(prop,tmp);
    } else {
      try {
        this.innerText = window[this.init] = window[this.init] ?? eval(this.init);
      } catch {
        this.innerText = window[this.init];
      }
      this.checkVal(this.init,()=>{
        this.innerText = window[this.init];
      },500);
    }
  }
  checkVal(variable='',action=this.defaultAction.bind(this),time=500){
    let oldVal=window[variable] || eval(variable);
    this.interval = setInterval(()=>{
      //print(window[variable]);
      if(window[variable]!=oldVal){
        //alert('hello');
        action();
      };
    },time);
  }
  stopObserving(){
    clearInterval(this.interval);
  }
  setupDataset(){
    this._data_ = new dataset();
    return this._data_;
  }
});


customElements.define('a-source', class source extends HTMLElement {
  constructor(){
    super();
    this.init = this.innerText;
    if(this.init[0]=='@'&&this.init.includes('/')){
      this.type = this.init.slice(this.init.indexOf('@')+1,this.init.indexOf('/'));
      let file = this.init.replace(('@'+this.type+'/'),'');
      //print(this.init);
      //print(file);
      fetch(file).then(d=>this.type!='html'?eval('d.'+this.type+'()'):d.text()).then(e=>this.type=='html'?this.innerHTML=e:this.innerText=e);
    }
  }
});

class a_heading extends HTMLElement {
  constructor() {
    super();
    let main = this.getAttribute('main');
    this.main = main;
    let text = this.innerText;
    this.text = text;
    this.innerHTML = `<span class="heading"><h1 class="child_main">______${main}______</h1><span class="child_non_main">${text}</span></span>`
  }
}
class a_mini_heading extends a_heading {
  constructor(){
    super();
    this.firstElementChild.style.fontSize='0.7em';
    this.text!=''?this.firstElementChild.lastElementChild.style.marginBottom='10px':this.firstElementChild.firstElementChild.style.marginBottom='10px';
  }
}
customElements.define('a-heading',a_heading);
customElements.define('a-mini-heading',a_mini_heading);
