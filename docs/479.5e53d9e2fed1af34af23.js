(self.webpackChunknotebookreact=self.webpackChunknotebookreact||[]).push([[479],{479:(e,a,t)=>{"use strict";t.r(a),t.d(a,{default:()=>u});var s=t(7294),r=t(6168),c=t(195),l=t(5615),n=t(2230),m=t(7267),o=t(3727);const u=function(e){const a=(0,s.useRef)(null),t=(0,s.useContext)(n.Z),u=(0,s.useContext)(m.Z),[i,h]=(0,c.x)({chatFieldValue:"",chatMessages:[]}),p=(0,s.useRef)(null),d=(0,s.useRef)(null);return(0,s.useEffect)((()=>{u.isChatOpen&&(t({type:"resetUnreadMessagesCount"}),p.current.focus())}),[u.isChatOpen]),(0,s.useEffect)((()=>(a.current=(0,l.Z)("http://localhost:8080"),a.current.on("chatFromServer",(e=>{h((a=>{a.chatMessages.push(e)}))})),()=>a.current.disconnect())),[]),(0,s.useEffect)((()=>{d.current.scrollTop=d.current.scrollHeight,i.chatMessages.length&&!u.isChatOpen&&(console.log(u.unreadMessagesCount),t({type:"increaseUnreadMessagesCount"}))}),[i.chatMessages]),s.createElement(s.Fragment,null,s.createElement("div",{id:"chat-wrapper",className:"chat-wrapper shadow border-top border-left border-right"+(u.isChatOpen?" chat-wrapper--is-visible":"")},s.createElement("div",{className:"chat-title-bar bg-primary"},"Chat",s.createElement("span",{onClick:()=>t({type:"closeChat"}),"data-for":"chat-close","data-tip":"Close",className:"chat-title-bar-close"},s.createElement("i",{className:"fas fa-times-circle"})),s.createElement(r.Z,{id:"chat-close",className:"custom-tooltip",place:"top"})),s.createElement("div",{id:"chat",ref:d,className:"chat-log"},i.chatMessages.map(((e,a)=>e.username==u.user.username?s.createElement("div",{key:a,className:"chat-self"},s.createElement("div",{className:"chat-message"},s.createElement("div",{className:"chat-message-inner"},e.message)),s.createElement("img",{className:"chat-avatar avatar-tiny",src:e.avatar})):s.createElement("div",{key:a,className:"chat-other"},s.createElement(o.rU,{to:`/profile/${e.username}`},s.createElement("img",{className:"avatar-tiny",src:e.avatar})),s.createElement("div",{className:"chat-message"},s.createElement("div",{className:"chat-message-inner"},s.createElement(o.rU,{to:`/profile/${e.username}`},s.createElement("strong",null,e.username,":")," "),e.message)))))),s.createElement("form",{onSubmit:function(e){e.preventDefault(),a.current.emit("chatFromBrowser",{message:i.chatFieldValue,token:u.user.token}),h((e=>{e.chatMessages.push({message:e.chatFieldValue,username:u.user.username,avatar:u.user.avatar}),e.chatFieldValue=""}))},id:"chatForm",className:"chat-form border-top"},s.createElement("input",{value:i.chatFieldValue,onChange:function(e){let a=e.target.value;h((e=>{e.chatFieldValue=a}))},ref:p,type:"text",className:"chat-field",id:"chatField",placeholder:"Type a message…",autoComplete:"off"}))))}}}]);