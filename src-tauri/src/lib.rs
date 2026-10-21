use std::sync::Mutex;
use tauri::{Emitter,Manager,State,menu::{Menu,MenuItem},tray::{TrayIconBuilder,TrayIconEvent,MouseButton,MouseButtonState}};
use tauri_plugin_clipboard_manager::ClipboardExt;
use tauri_plugin_global_shortcut::{GlobalShortcutExt,ShortcutState};

#[derive(Default)]
struct Pending(Mutex<Option<String>>);

fn show_main(app:&tauri::AppHandle){if let Some(w)=app.get_webview_window("main"){let _=w.show();let _=w.unminimize();let _=w.set_focus();}}
fn show_quick(app:&tauri::AppHandle){
 // Reading happens only after a user presses the shortcut or selects the tray action.
 let text=app.clipboard().read_text().unwrap_or_default();
 let text:String=text.chars().take(6000).collect();
 if let Ok(mut pending)=app.state::<Pending>().0.lock(){*pending=Some(text.clone());}
 if let Some(w)=app.get_webview_window("quick"){let _=w.show();let _=w.unminimize();let _=w.set_focus();let _=w.emit("quick-lookup",text);}
}
#[tauri::command]
fn read_clipboard(app:tauri::AppHandle)->Result<String,String>{app.clipboard().read_text().map(|s|s.chars().take(6000).collect()).map_err(|_|"clipboard_unavailable".into())}
#[tauri::command]
fn take_pending_query(state:State<'_,Pending>)->Option<String>{state.0.lock().ok().and_then(|mut v|v.take())}
#[tauri::command]
fn open_main(app:tauri::AppHandle){show_main(&app);}
#[tauri::command]
fn hide_quick(app:tauri::AppHandle){if let Some(w)=app.get_webview_window("quick"){let _=w.hide();}}
fn credential()->Result<keyring::Entry,String>{keyring::Entry::new("com.jerry.quicksense","translation-service").map_err(|_|"credential_store_unavailable".into())}
#[tauri::command]
fn save_service_key(key:String)->Result<(),String>{let entry=credential()?;if key.is_empty(){match entry.delete_credential(){Ok(())|Err(keyring::Error::NoEntry)=>Ok(()),_=>Err("credential_store_unavailable".into())}}else{entry.set_password(&key).map_err(|_|"credential_store_unavailable".into())}}
#[tauri::command]
fn has_service_key()->bool{credential().and_then(|e|e.get_password().map_err(|_|String::new())).is_ok()}
#[tauri::command]
async fn analyze_text(query:String,source:String,target:String,service_url:String)->Result<serde_json::Value,String>{
 if query.trim().is_empty()||query.chars().count()>6000{return Err("input_too_long".into());}
 let mut url=url::Url::parse(&service_url).map_err(|_|"invalid_service_url")?;
 if !url.username().is_empty()||url.password().is_some()||url.query().is_some()||url.fragment().is_some(){return Err("invalid_service_url".into());}
 let local=matches!(url.host_str(),Some("localhost"|"127.0.0.1"|"::1"));
 if url.scheme()!="https"&&!(url.scheme()=="http"&&local){return Err("invalid_service_url".into());}
 let path=format!("{}/analyze",url.path().trim_end_matches('/'));url.set_path(&path);
 let key=credential()?.get_password().map_err(|_|"service_key_missing")?;
 let client=reqwest::Client::builder().timeout(std::time::Duration::from_secs(35)).redirect(reqwest::redirect::Policy::none()).build().map_err(|_|"network_error")?;
 let response=client.post(url).bearer_auth(key).json(&serde_json::json!({"text":query,"source":source,"target":target})).send().await.map_err(|_|"network_error")?;
 let status=response.status();let body:serde_json::Value=response.json().await.map_err(|_|"invalid_response")?;
 if !status.is_success(){return Err(body.get("error").and_then(|v|v.as_str()).unwrap_or("translation_failed").to_owned());}
 body.get("analysis").cloned().ok_or("invalid_response".into())
}
pub fn run(){
 tauri::Builder::default()
 .manage(Pending::default())
 .plugin(tauri_plugin_single_instance::init(|app,_,_|show_main(app)))
 .plugin(tauri_plugin_clipboard_manager::init())
 .plugin(tauri_plugin_global_shortcut::Builder::new().with_handler(|app,_,event|{if event.state()==ShortcutState::Pressed{show_quick(app);}}).build())
 .invoke_handler(tauri::generate_handler![read_clipboard,take_pending_query,open_main,hide_quick,save_service_key,has_service_key,analyze_text])
 .setup(|app|{
  let show=MenuItem::with_id(app,"show","Open QuickSense",true,None::<&str>)?;
  let quick=MenuItem::with_id(app,"quick","Quick lookup from clipboard",true,None::<&str>)?;
  let quit=MenuItem::with_id(app,"quit","Quit",true,None::<&str>)?;
  let menu=Menu::with_items(app,&[&show,&quick,&quit])?;
  let mut tray=TrayIconBuilder::new().menu(&menu).tooltip("QuickSense · 快懂").show_menu_on_left_click(false)
   .on_menu_event(|app,event|match event.id.as_ref(){"show"=>show_main(app),"quick"=>show_quick(app),"quit"=>app.exit(0),_=>{}})
   .on_tray_icon_event(|tray,event|{if let TrayIconEvent::Click{button:MouseButton::Left,button_state:MouseButtonState::Up,..}=event{show_main(tray.app_handle());}});
  if let Some(icon)=app.default_window_icon(){tray=tray.icon(icon.clone());}
  tray.build(app)?;
  if let Err(error)=app.global_shortcut().register("CommandOrControl+Shift+Space"){eprintln!("QuickSense shortcut registration failed: {error}");}
  Ok(())
 })
 .on_window_event(|window,event|{if let tauri::WindowEvent::CloseRequested{api,..}=event{api.prevent_close();let _=window.hide();}})
 .run(tauri::generate_context!()).expect("QuickSense could not start");
}
