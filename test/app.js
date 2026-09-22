/* OnlyExit v2 — interactions */
(function(){
  'use strict';

  /* ── Scroll reveal ── */
  var ease = 'cubic-bezier(.12,.23,.5,1)';
  function sweep(){
    if(document.hidden||innerHeight===0)return;
    document.querySelectorAll('[data-appear]:not(.revealed)').forEach(function(el){
      var r=el.getBoundingClientRect();
      if(r.top<innerHeight*.95&&r.bottom>0||el.closest('header')){
        var d=parseFloat(el.dataset.appear)||0;
        var y=el.dataset.y||24;
        el.style.transitionDelay=d+'s,'+d+'s';
        el.classList.add('revealed');
      }
    });
    document.querySelectorAll('.hero h1 span:not(.revealed)').forEach(function(w,i){
      w.style.transitionDelay=(i*.05)+'s,'+(i*.05)+'s,'+(i*.05)+'s';
      w.classList.add('revealed');
    });
  }
  setInterval(sweep,120);
  addEventListener('scroll',sweep,{passive:true});
  addEventListener('load',sweep);

  /* ── Program tabs ── */
  var tabBtns=document.querySelectorAll('.program__tab');
  var tabImg=document.querySelector('.program__photo img');
  var tabCardTitle=document.querySelector('.program__card-title');
  var tabRowsEl=document.querySelector('.program__card-rows');
  var tabsData=[
    {title:'A plan for your team',img:'https://onlyexit.ai/assets/social-firechat.webp',card:'Plan · written with the GP',rows:[['Go to market','first two weeks','Plan'],['Fundraising','weeks three to six','Plan'],['Product and hiring','through Demo Day','Plan']]},
    {title:'Working sessions',img:'https://onlyexit.ai/assets/social-pitch.webp',card:'Sessions · this week',rows:[['Pricing that survives a real buyer','with a Seattle operator','Session'],['Reading a term sheet','with a founder who has raised','Session'],['First five hires, in order','with an operator who has hired','Session'],['Getting the first ten customers','with an operator who sold into the vertical','Session']]},
    {title:'Numbers on camera',img:'https://onlyexit.ai/assets/social-poster.webp',card:'Stream · weekly report',rows:[['Revenue','this week against last','Reported'],['NRR','what existing customers did','Reported'],['Cold calls and demos','how many, and what came back','Reported'],['Burn','what it cost to get there','Reported']]},
    {title:'Demo Day',img:'https://onlyexit.ai/assets/social-boat.webp',card:'Demo Day · first week of November',rows:[['Investors in the room','Cohort 0','Nov 2026'],['Each team shows what it shipped','ten weeks of work','Demo'],['Cohort 1 Demo Day','after the January batch','2027']]}
  ];
  function setTab(i){
    tabBtns.forEach(function(b,j){
      b.classList.toggle('program__tab--active',j===i);
    });
    if(tabImg)tabImg.src=tabsData[i].img;
    if(tabCardTitle)tabCardTitle.textContent=tabsData[i].card;
    if(tabRowsEl){
      tabRowsEl.innerHTML='';
      tabsData[i].rows.forEach(function(r){
        var div=document.createElement('div');div.className='program__card-row';
        div.innerHTML='<div class="program__card-row-text"><div class="program__card-row-a">'+r[0]+'</div><div class="program__card-row-b">'+r[1]+'</div></div><span class="program__card-row-tag">'+r[2]+'</span>';
        tabRowsEl.appendChild(div);
      });
    }
  }
  tabBtns.forEach(function(b,i){b.addEventListener('click',function(){setTab(i)})});

  /* ── FAQ accordion ── */
  var faqItems=document.querySelectorAll('.faq__item');
  faqItems.forEach(function(item){
    var btn=item.querySelector('.faq__question');
    var answer=item.querySelector('.faq__answer');
    var sign=item.querySelector('.faq__sign');
    btn.addEventListener('click',function(){
      var isOpen=answer.classList.contains('faq__answer--open');
      faqItems.forEach(function(it){
        it.querySelector('.faq__answer').classList.remove('faq__answer--open');
        it.querySelector('.faq__sign').textContent='+';
      });
      if(!isOpen){
        answer.classList.add('faq__answer--open');
        sign.textContent='−';
      }
    });
  });
  var firstFaq=document.querySelector('.faq__answer');
  if(firstFaq){firstFaq.classList.add('faq__answer--open');firstFaq.parentElement.querySelector('.faq__sign').textContent='−';}

  /* ── Cohort toggle ── */
  var c0btn=document.getElementById('toggle-c0');
  var c1btn=document.getElementById('toggle-c1');
  var founderCard=document.getElementById('ways-founder');
  var c1Data={text:'Cohort 1 opens January 2027. Applications are open now.',items:['Early admissions January 4, 2027','Full batch January 18, 2027','10+2 weeks, full time, in Seattle','Demo Day with investors in the room'],cta:'Apply to Cohort 1',href:'apply.html',showBadge:true};
  var c0Data={text:'Cohort 0 is running now, August to early November 2026.',items:['Three teams in the house','Weekly numbers on the stream','Demo Day in the first week of November 2026','Investors in the room'],cta:'',href:'',showBadge:false};

  function setCohort(n){
    var d=n===1?c1Data:c0Data;
    if(c0btn&&c1btn){
      c0btn.classList.toggle('ways__toggle-btn--active',n===0);
      c0btn.classList.toggle('ways__toggle-btn--inactive',n!==0);
      c1btn.classList.toggle('ways__toggle-btn--active',n===1);
      c1btn.classList.toggle('ways__toggle-btn--inactive',n!==1);
    }
    if(!founderCard)return;
    founderCard.querySelector('.ways__card-desc').textContent=d.text;
    var itemsEl=founderCard.querySelector('.ways__card-items');
    itemsEl.innerHTML='';
    d.items.forEach(function(it){
      var div=document.createElement('div');div.className='ways__card-item';
      div.innerHTML='<span class="ways__card-item-dot"></span><span>'+it+'</span>';
      itemsEl.appendChild(div);
    });
    var ctaEl=founderCard.querySelector('.ways__card-cta');
    if(d.cta){ctaEl.style.display='';ctaEl.textContent=d.cta;ctaEl.href=d.href;}
    else{ctaEl.style.display='none';}
    var badge=founderCard.querySelector('.ways__card-badge');
    if(badge)badge.style.display=d.showBadge?'':'none';
    founderCard.classList.toggle('ways__card--highlight',n===1);
    founderCard.style.borderColor=n===1?'rgba(255,255,255,.22)':'rgba(255,255,255,.08)';
  }
  if(c0btn)c0btn.addEventListener('click',function(){setCohort(0)});
  if(c1btn)c1btn.addEventListener('click',function(){setCohort(1)});

  /* ── Toast queue ── */
  var queueItems=[
    ['done','Weekly numbers reported','#68cc58'],
    ['running','Working session: fundraising','#f0bf00'],
    ['queued','Demo Day prep','#8a8f98'],
    ['done','Plan reviewed with the GP','#68cc58'],
    ['running','Shipping this week’s build','#f0bf00'],
    ['queued','Session: go to market','#8a8f98']
  ];
  var queueEl=document.querySelector('.queue__inner');
  var qi=3,qid=3;
  function makeCard(q){
    var state=q[0],task=q[1],c=q[2];
    var stateLabel=state==='done'?'Done':state==='running'?'Working':'Queued';
    var div=document.createElement('div');div.className='queue__item';
    div.innerHTML='<div class="queue__item-wrap"><div class="queue__item-pad"><div class="queue__card'+(state==='queued'?' queue__card--queued':'')+'"><span class="queue__label"><span class="queue__dot'+(state==='running'?' queue__dot--running':'')+'" style="background:'+c+';box-shadow:0 0 6px '+c+'80"></span>'+stateLabel+'</span><span class="queue__task">'+task+'</span></div></div></div>';
    return div;
  }
  if(queueEl){
    for(var i=0;i<3;i++){queueEl.appendChild(makeCard(queueItems[i]))}
    setInterval(function(){
      var item=queueItems[qi%queueItems.length];qi++;
      queueEl.appendChild(makeCard(item));
      while(queueEl.children.length>3)queueEl.removeChild(queueEl.firstChild);
    },2200);
  }

  /* ── Particle wordmark canvas ── */
  var cv=document.querySelector('[data-stars]');
  if(cv){
    var ctx=cv.getContext('2d'),W=0,H=0,pts=[];
    var im=new Image();im.src='assets/OnlyExit-Wordmark-White.svg';
    function seed(){
      try{
        if(!im.complete||!im.naturalWidth)return;
        var r=cv.parentElement.getBoundingClientRect();W=cv.width=r.width;H=cv.height=r.height;
        var sw=300,sh=Math.max(1,Math.round(sw*im.naturalHeight/im.naturalWidth));
        var oc=document.createElement('canvas');oc.width=sw;oc.height=sh;
        var octx=oc.getContext('2d');octx.drawImage(im,0,0,sw,sh);
        var data=octx.getImageData(0,0,sw,sh).data;
        var scale=Math.min((W*.8)/sw,(H*.26)/sh),ox=W-sw*scale-W*.04,oy=H*.2-sh*scale/2;
        pts=[];
        var opaque=0;for(var i=3;i<data.length;i+=4)if(data[i]/255>=.5)opaque++;
        var keep=Math.min(1,2600/Math.max(1,opaque));
        for(var y=0;y<sh;y++)for(var x=0;x<sw;x++){
          var a=data[(y*sw+x)*4+3]/255;
          if(a<.5||Math.random()>keep)continue;
          var hx=ox+(x+Math.random())*scale,hy=oy+(y+Math.random())*scale;
          pts.push({hx:hx,hy:hy,rx:Math.random()*W,ry:Math.random()*H,r:Math.random()*.55+.3,p:Math.random()*Math.PI*2,s:.25+Math.random()*.9,d:Math.random()});
        }
      }catch(e){}
    }
    im.onload=seed;seed();
    var ro=new ResizeObserver(seed);ro.observe(cv.parentElement);
    function inView(){var r=cv.getBoundingClientRect();return r.bottom>-200&&r.top<(innerHeight||1000)+200}
    function ez(v){return v<.5?4*v*v*v:1-Math.pow(-2*v+2,3)/2}
    function draw(t){
      if(!inView())return;
      ctx.clearRect(0,0,W,H);
      var base=.55,cyc=(t/9000)%1;
      var form=cyc<.4?ez(cyc/.4):cyc<.7?1:1-ez((cyc-.7)/.3);
      for(var i=0;i<pts.length;i++){
        var q=pts[i];
        var f=Math.min(1,Math.max(0,(form-q.d*.25)/.75));
        var x=q.rx+(q.hx-q.rx)*f,y=q.ry+(q.hy-q.ry)*f;
        var a=base*(.15+.85*f)*(.7+.3*Math.sin(t/500+q.p));
        var big=f>.98&&Math.sin(t/300+q.p)>.9;
        if(a<.02)continue;
        ctx.globalAlpha=Math.min(1,a);ctx.fillStyle=big?'#d6feff':'#00f0ff';
        var s=q.r*(big?3:2);ctx.fillRect(x-s/2,y-s/2,s,s);
      }
    }
    setInterval(function(){draw(performance.now())},33);draw(performance.now());
  }

  /* ── Apply page: technical toggle ── */
  var techBtns=document.querySelectorAll('.apply-tech-btn');
  techBtns.forEach(function(b){
    b.addEventListener('click',function(){
      var wasActive=b.classList.contains('apply-tech-btn--active');
      techBtns.forEach(function(x){x.classList.remove('apply-tech-btn--active')});
      if(!wasActive)b.classList.add('apply-tech-btn--active');
    });
  });

  /* ── Apply page: yes/no toggles ── */
  document.querySelectorAll('.apply-toggle-btns').forEach(function(pair){
    var btns=pair.querySelectorAll('.apply-toggle-btn');
    btns.forEach(function(b){
      b.addEventListener('click',function(){
        var wasActive=b.classList.contains('apply-toggle-btn--active');
        btns.forEach(function(x){x.classList.remove('apply-toggle-btn--active')});
        if(!wasActive)b.classList.add('apply-toggle-btn--active');
      });
    });
  });

  /* ── Apply page: add cofounder ── */
  var addCf=document.getElementById('add-cofounder');
  var cfContainer=document.getElementById('cofounder-rows');
  if(addCf&&cfContainer){
    var cfCount=1;
    addCf.addEventListener('click',function(){
      cfCount++;
      var row=document.createElement('div');row.className='apply-grid-2';
      row.innerHTML='<label class="apply-label">Cofounder Name<input type="text" class="apply-input"></label><label class="apply-label">Cofounder LinkedIn<input type="text" class="apply-input"></label>';
      cfContainer.appendChild(row);
    });
  }

  /* ── Apply page: form submit ── */
  var applyForm=document.getElementById('apply-form');
  var successMsg=document.getElementById('apply-success');
  if(applyForm){
    applyForm.addEventListener('submit',function(e){
      e.preventDefault();
      if(successMsg)successMsg.style.display='flex';
    });
  }
})();
