window.__ModuleLoader__.load({
	id: "@civright/legaldesk-harness",
	factory: (require) => {
		var module = { exports: {} };
		var exports = module.exports;
		Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
		let react_jsx_runtime = require("react/jsx-runtime");
		let react = require("react");
		let react_dom = require("react-dom");
		//#region \0dsh-css:/Users/zhanghongqian/Desktop/civright/harness/legaldesk-harness/src/client/workbench.module.css.mjs
		const css = "*{box-sizing:border-box}._7RUDUa_entry{width:100%;min-height:40px;color:var(--dsw-alias-label-secondary);font:inherit;cursor:pointer;background:0 0;border:0;border-radius:8px;align-items:center;gap:10px;padding:0 10px;transition:background .16s,color .16s;display:flex}._7RUDUa_entry:hover{background:var(--dsw-alias-interactive-bg-hover);color:var(--dsw-alias-label-primary)}._7RUDUa_entry:focus-visible,._7RUDUa_app button:focus-visible,._7RUDUa_app input:focus-visible,._7RUDUa_app select:focus-visible,._7RUDUa_app textarea:focus-visible{outline:2px solid var(--dsw-alias-brand-primary);outline-offset:2px}._7RUDUa_app{z-index:2147483647;background:var(--dsw-alias-bg-base);color:var(--dsw-alias-label-primary);font-family:var(--dsw-font-family), ui-sans-serif, system-ui, \"PingFang SC\", sans-serif;grid-template-columns:248px minmax(0,1fr);display:grid;position:fixed;inset:0}._7RUDUa_skipLink{z-index:2147483647;background:var(--dsw-alias-button-primary-fill);color:var(--dsw-alias-label-primary-inverted);border-radius:6px;padding:10px 14px;position:fixed;top:-48px;left:270px}._7RUDUa_skipLink:focus{top:12px}._7RUDUa_rail{background:var(--dsw-alias-bg-layer-1);border-right:1px solid var(--dsw-alias-border-subtle);flex-direction:column;min-height:0;padding:24px 16px 16px;display:flex}._7RUDUa_brand{align-items:center;gap:12px;padding:0 8px 24px;display:flex}._7RUDUa_brandMark,._7RUDUa_largeMark{background:var(--dsw-alias-label-primary);width:34px;height:34px;color:var(--dsw-alias-bg-base);border-radius:7px;place-items:center;font:600 20px/1 Georgia,serif;display:grid}._7RUDUa_brand>span:last-child{flex-direction:column;gap:2px;display:flex}._7RUDUa_brand strong{letter-spacing:.01em;font:600 16px/1.2 Georgia,Songti SC,serif}._7RUDUa_brand small{color:var(--dsw-alias-label-tertiary);font-size:11px}._7RUDUa_nav{border-bottom:1px solid var(--dsw-alias-border-subtle);flex-direction:column;gap:4px;padding-bottom:20px;display:flex}._7RUDUa_navItem{width:100%;min-height:44px;color:var(--dsw-alias-label-secondary);text-align:left;cursor:pointer;background:0 0;border:0;border-radius:8px;grid-template-columns:22px 1fr auto;align-items:center;gap:10px;padding:0 11px;font:500 13px/1 inherit;transition:background .16s,color .16s;display:grid;position:relative}._7RUDUa_navItem:hover{background:var(--dsw-alias-interactive-bg-hover);color:var(--dsw-alias-label-primary)}._7RUDUa_navItem small{background:var(--dsw-alias-bg-layer-3);text-align:center;border-radius:10px;min-width:20px;padding:2px 6px;font-size:10px}._7RUDUa_navActive{background:var(--dsw-alias-interactive-bg-active);color:var(--dsw-alias-label-primary)}._7RUDUa_navActive:before{content:\"\";background:var(--dsw-alias-brand-primary);border-radius:0 2px 2px 0;width:3px;position:absolute;top:10px;bottom:10px;left:-16px}._7RUDUa_caseDirectory{flex-direction:column;flex:1;min-height:0;padding-top:20px;display:flex}._7RUDUa_directoryHead{height:36px;color:var(--dsw-alias-label-tertiary);letter-spacing:.08em;justify-content:space-between;align-items:center;padding:0 8px;font-size:11px;font-weight:600;display:flex}._7RUDUa_directoryHead button{width:36px;height:36px;color:inherit;cursor:pointer;background:0 0;border:0;border-radius:7px;place-items:center;display:grid}._7RUDUa_directoryHead button:hover{background:var(--dsw-alias-interactive-bg-hover);color:var(--dsw-alias-label-primary)}._7RUDUa_caseList{padding-top:4px;overflow:auto}._7RUDUa_caseItem{width:100%;min-height:56px;color:inherit;text-align:left;cursor:pointer;background:0 0;border:0;border-radius:8px;grid-template-columns:30px minmax(0,1fr);align-items:center;gap:10px;padding:7px 8px;display:grid}._7RUDUa_caseItem:hover{background:var(--dsw-alias-interactive-bg-hover)}._7RUDUa_caseItem>span:last-child{flex-direction:column;gap:4px;min-width:0;display:flex}._7RUDUa_caseItem strong{text-overflow:ellipsis;white-space:nowrap;font-size:12px;font-weight:500;overflow:hidden}._7RUDUa_caseItem small{color:var(--dsw-alias-label-tertiary);font-size:10px}._7RUDUa_caseInitial{background:var(--dsw-alias-bg-layer-3);width:30px;height:30px;color:var(--dsw-alias-label-secondary);border-radius:7px;place-items:center;font:600 13px Georgia,Songti SC,serif;display:grid}._7RUDUa_caseActive{background:var(--dsw-alias-interactive-bg-active)}._7RUDUa_caseActive ._7RUDUa_caseInitial{background:var(--dsw-alias-label-primary);color:var(--dsw-alias-bg-base)}._7RUDUa_backHarness{min-height:44px;color:var(--dsw-alias-label-secondary);cursor:pointer;background:0 0;border:0;border-radius:8px;align-items:center;gap:10px;padding:0 11px;font:500 12px inherit;display:flex}._7RUDUa_backHarness:hover{background:var(--dsw-alias-interactive-bg-hover);color:var(--dsw-alias-label-primary)}._7RUDUa_workspace{background:var(--dsw-alias-bg-base);flex-direction:column;min-width:0;min-height:0;display:flex}._7RUDUa_topbar{border-bottom:1px solid var(--dsw-alias-border-subtle);flex:none;justify-content:space-between;align-items:center;height:72px;padding:0 clamp(24px,4vw,56px);display:flex}._7RUDUa_context{align-items:baseline;gap:10px;display:flex}._7RUDUa_context span{color:var(--dsw-alias-label-tertiary);font-size:11px}._7RUDUa_context strong{font-size:13px;font-weight:600}._7RUDUa_context small{color:var(--dsw-alias-label-tertiary);font-size:11px}._7RUDUa_localStatus{color:var(--dsw-alias-label-secondary);align-items:center;gap:8px;font-size:11px;display:flex}._7RUDUa_statusDot{background:var(--dsw-alias-state-success-primary);border-radius:50%;width:7px;height:7px}._7RUDUa_divider{background:var(--dsw-alias-border-l2);width:1px;height:12px;margin:0 4px}._7RUDUa_content{flex:1;min-height:0;padding:clamp(32px,5vw,64px) clamp(28px,6vw,80px) 80px;overflow:auto}._7RUDUa_page{width:min(1180px,100%);margin:0 auto}._7RUDUa_pageHeading{justify-content:space-between;align-items:flex-end;gap:32px;margin-bottom:36px;display:flex}._7RUDUa_pageHeading>div{max-width:720px}._7RUDUa_pageHeading span,._7RUDUa_noMatter>span:not(._7RUDUa_largeMark){color:var(--dsw-alias-label-tertiary);letter-spacing:.14em;text-transform:uppercase;margin-bottom:10px;font-size:10px;font-weight:600;display:block}._7RUDUa_pageHeading h1{letter-spacing:-.02em;margin:0;font:600 clamp(28px,3vw,38px)/1.2 Georgia,Songti SC,serif}._7RUDUa_pageHeading p{color:var(--dsw-alias-label-secondary);margin:12px 0 0;font-size:13px;line-height:1.7}._7RUDUa_pageHeading input[type=file]{display:none}._7RUDUa_metrics{border:1px solid var(--dsw-alias-border-subtle);background:var(--dsw-alias-bg-layer-1);grid-template-columns:repeat(4,minmax(0,1fr));margin-bottom:24px;display:grid}._7RUDUa_metric{border-right:1px solid var(--dsw-alias-border-subtle);grid-template-columns:1fr;align-content:center;min-height:132px;padding:22px 24px;display:grid}._7RUDUa_metric:last-child{border-right:0}._7RUDUa_metric>strong{font-variant-numeric:tabular-nums;font:500 32px/1 Georgia,serif}._7RUDUa_metric>span{margin-top:13px;font-size:12px;font-weight:600}._7RUDUa_metric small{color:var(--dsw-alias-label-tertiary);margin-top:5px;font-size:10px}._7RUDUa_metricEmphasis{background:var(--dsw-alias-state-warn-tertiary)}._7RUDUa_primaryPanel{background:var(--dsw-alias-label-primary);min-height:180px;color:var(--dsw-alias-bg-base);justify-content:space-between;align-items:center;gap:40px;margin-bottom:24px;padding:32px 36px;display:flex}._7RUDUa_panelIntro{max-width:680px}._7RUDUa_stepLabel{color:var(--dsw-alias-label-primary-inverted);opacity:.65;letter-spacing:.12em;font-size:10px}._7RUDUa_panelIntro h2{margin:10px 0 8px;font:500 25px/1.3 Georgia,Songti SC,serif}._7RUDUa_panelIntro p{max-width:620px;color:var(--dsw-alias-label-primary-inverted);opacity:.72;margin:0;font-size:12px;line-height:1.7}._7RUDUa_primaryPanel ._7RUDUa_primaryButton{background:var(--dsw-alias-bg-base);color:var(--dsw-alias-label-primary);border-color:#0000}._7RUDUa_overviewGrid{grid-template-columns:1fr 1fr;gap:24px;display:grid}._7RUDUa_surface{border:1px solid var(--dsw-alias-border-subtle);background:var(--dsw-alias-bg-layer-1);margin-bottom:24px;padding:24px}._7RUDUa_sectionHead{border-bottom:1px solid var(--dsw-alias-border-subtle);justify-content:space-between;align-items:flex-start;height:34px;margin-bottom:18px;display:flex}._7RUDUa_sectionHead h2{margin:0;font-size:13px;font-weight:600}._7RUDUa_sectionHead button{color:var(--dsw-alias-label-secondary);cursor:pointer;background:0 0;border:0;align-items:center;gap:5px;font:500 11px inherit;display:flex}._7RUDUa_runSummary{grid-template-columns:40px 1fr auto;align-items:center;gap:12px;display:grid}._7RUDUa_runSummary>div{flex-direction:column;gap:5px;min-width:0;display:flex}._7RUDUa_runSummary strong{font-size:12px}._7RUDUa_runSummary code{text-overflow:ellipsis;color:var(--dsw-alias-label-tertiary);font-size:10px;overflow:hidden}._7RUDUa_agentSymbol{background:var(--dsw-alias-bg-layer-3);width:40px;height:40px;color:var(--dsw-alias-label-secondary);border-radius:8px;place-items:center;display:grid}._7RUDUa_todo{align-items:center;gap:14px;display:flex}._7RUDUa_todo>span{font:500 32px Georgia,serif}._7RUDUa_todo>div{flex-direction:column;gap:5px;display:flex}._7RUDUa_todo strong{font-size:12px}._7RUDUa_todo small,._7RUDUa_emptyLine{color:var(--dsw-alias-label-tertiary);font-size:11px}._7RUDUa_emptyLine{margin:29px 0}._7RUDUa_primaryButton,._7RUDUa_secondaryButton{background:var(--dsw-alias-button-primary-fill);min-height:44px;color:var(--dsw-alias-label-primary-inverted);cursor:pointer;border:1px solid #0000;border-radius:7px;justify-content:center;align-items:center;gap:8px;padding:0 16px;font:600 12px inherit;transition:background .16s,opacity .16s;display:inline-flex}._7RUDUa_primaryButton:hover{background:var(--dsw-alias-button-primary-hover)}._7RUDUa_secondaryButton{border-color:var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-base);color:var(--dsw-alias-label-primary)}._7RUDUa_secondaryButton:hover{background:var(--dsw-alias-interactive-bg-hover)}._7RUDUa_primaryButton:disabled,._7RUDUa_secondaryButton:disabled{opacity:.42;cursor:not-allowed}._7RUDUa_tableToolbar{border-bottom:1px solid var(--dsw-alias-border-subtle);justify-content:space-between;align-items:flex-start;min-height:52px;margin-bottom:2px;padding-bottom:16px;display:flex}._7RUDUa_tableToolbar>div{flex-direction:column;gap:5px;display:flex}._7RUDUa_tableToolbar strong{font-size:13px}._7RUDUa_tableToolbar span{color:var(--dsw-alias-label-tertiary);font-size:10px}._7RUDUa_materialTable{flex-direction:column;display:flex}._7RUDUa_materialRow{border-bottom:1px solid var(--dsw-alias-border-subtle);cursor:pointer;grid-template-columns:20px 40px minmax(200px,1fr) 110px 150px;align-items:center;gap:12px;min-height:72px;display:grid}._7RUDUa_materialRow:last-child{border-bottom:0}._7RUDUa_materialRow:hover{background:var(--dsw-alias-interactive-bg-hover)}._7RUDUa_materialRow>span{flex-direction:column;gap:5px;display:flex}._7RUDUa_materialRow strong{font-size:12px;font-weight:500}._7RUDUa_materialRow small{color:var(--dsw-alias-label-tertiary);font-size:10px}._7RUDUa_fileGlyph,._7RUDUa_snapshotIcon{background:var(--dsw-alias-bg-layer-3);width:36px;color:var(--dsw-alias-label-secondary);border-radius:7px;place-items:center;height:36px!important;display:grid!important}._7RUDUa_fileName{min-width:0}._7RUDUa_fileName strong{text-overflow:ellipsis;white-space:nowrap;overflow:hidden}._7RUDUa_hash code{color:var(--dsw-alias-label-secondary);font-size:10px}._7RUDUa_snapshotList{grid-template-columns:repeat(3,minmax(0,1fr));gap:10px;display:grid}._7RUDUa_snapshotItem{border:1px solid var(--dsw-alias-border-subtle);background:var(--dsw-alias-bg-base);min-height:68px;color:inherit;text-align:left;cursor:pointer;border-radius:8px;grid-template-columns:36px minmax(0,1fr) auto;align-items:center;gap:10px;padding:10px;display:grid}._7RUDUa_snapshotItem:hover,._7RUDUa_snapshotActive{border-color:var(--dsw-alias-brand-primary);background:var(--dsw-alias-interactive-bg-hover-accent)}._7RUDUa_snapshotItem>span:nth-child(2){flex-direction:column;gap:5px;min-width:0;display:flex}._7RUDUa_snapshotItem strong{text-overflow:ellipsis;white-space:nowrap;font-size:11px;overflow:hidden}._7RUDUa_snapshotItem small{color:var(--dsw-alias-label-tertiary);font-size:9px}._7RUDUa_selectedTag{color:var(--dsw-alias-brand-primary);font-size:9px}._7RUDUa_snapshotChooser{border:1px solid var(--dsw-alias-border-subtle);background:var(--dsw-alias-bg-layer-1);grid-template-columns:150px minmax(260px,520px);align-items:center;gap:8px 16px;margin-bottom:20px;padding:20px 24px;display:grid}._7RUDUa_snapshotChooser label{font-size:12px;font-weight:600}._7RUDUa_snapshotChooser select{border:1px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-base);height:44px;color:inherit;border-radius:7px;padding:0 12px;font:12px inherit}._7RUDUa_snapshotChooser small{color:var(--dsw-alias-label-tertiary);grid-column:2;font-size:10px}._7RUDUa_agentList{border:1px solid var(--dsw-alias-border-subtle);background:var(--dsw-alias-bg-layer-1)}._7RUDUa_agentRow{border-bottom:1px solid var(--dsw-alias-border-subtle);grid-template-columns:36px 48px minmax(260px,1fr) 150px 140px;align-items:center;gap:18px;min-height:138px;padding:24px 28px;display:grid}._7RUDUa_agentRow:last-child{border-bottom:0}._7RUDUa_agentIndex{color:var(--dsw-alias-label-tertiary);align-self:start;padding-top:3px;font:500 10px ui-monospace,monospace}._7RUDUa_agentRow h2{margin:0 0 8px;font:600 17px Georgia,Songti SC,serif}._7RUDUa_agentRow p{color:var(--dsw-alias-label-secondary);margin:0;font-size:11px;line-height:1.7}._7RUDUa_agentMeta{color:var(--dsw-alias-label-tertiary);flex-direction:column;gap:8px;font-size:10px;display:flex}._7RUDUa_agentMeta span:before{content:\"\";border:1px solid;border-radius:50%;width:5px;height:5px;margin-right:7px;display:inline-block}._7RUDUa_runTable{flex-direction:column;display:flex}._7RUDUa_tableHeader,._7RUDUa_runTableRow{grid-template-columns:1.15fr 1.6fr 120px 90px 110px;align-items:center;gap:16px;display:grid}._7RUDUa_tableHeader{border-bottom:1px solid var(--dsw-alias-border-subtle);height:42px;color:var(--dsw-alias-label-tertiary);font-size:10px}._7RUDUa_runTableRow{border-bottom:1px solid var(--dsw-alias-border-subtle);min-height:78px;font-size:11px;position:relative}._7RUDUa_runTableRow:last-child{border-bottom:0}._7RUDUa_runTableRow>span:first-child{flex-direction:column;gap:4px;display:flex}._7RUDUa_runTableRow strong{font-size:12px}._7RUDUa_runTableRow small{color:var(--dsw-alias-label-tertiary);font-size:9px}._7RUDUa_runTableRow code{text-overflow:ellipsis;color:var(--dsw-alias-label-secondary);font-size:9px;overflow:hidden}._7RUDUa_runTableRow>button{color:var(--dsw-alias-label-primary);cursor:pointer;background:0 0;border:0;align-items:center;gap:5px;font:600 10px inherit;display:flex}._7RUDUa_runError{border-left:2px solid var(--dsw-alias-state-error-primary);background:var(--dsw-alias-state-error-secondary);color:var(--dsw-alias-label-error);grid-column:1/-1;margin:-8px 0 10px;padding:8px 10px;font-size:10px}._7RUDUa_badge{background:var(--dsw-alias-bg-layer-3);width:max-content;color:var(--dsw-alias-label-secondary);border-radius:20px;align-items:center;gap:6px;padding:5px 8px;flex-direction:row!important;font-size:9px!important;display:inline-flex!important}._7RUDUa_badge>span{background:currentColor;border-radius:50%;width:6px;height:6px}._7RUDUa_badge_failed{color:var(--dsw-alias-state-error-primary);background:var(--dsw-alias-state-error-secondary)}._7RUDUa_badge_completed,._7RUDUa_badge_approved{color:var(--dsw-alias-state-success-primary);background:var(--dsw-alias-state-success-secondary)}._7RUDUa_badge_running,._7RUDUa_badge_pending_review{color:var(--dsw-alias-state-warn-label);background:var(--dsw-alias-state-warn-tertiary)}._7RUDUa_reviewList{flex-direction:column;gap:16px;display:flex}._7RUDUa_reviewCard{border:1px solid var(--dsw-alias-border-subtle);background:var(--dsw-alias-bg-layer-1)}._7RUDUa_reviewCard>header{justify-content:space-between;align-items:center;min-height:112px;padding:22px 24px;display:flex}._7RUDUa_reviewCard header>div{grid-template-columns:auto 1fr;align-items:center;gap:8px 12px;display:grid}._7RUDUa_reviewCard h2{margin:0;font:600 17px Georgia,Songti SC,serif}._7RUDUa_reviewCard header p{color:var(--dsw-alias-label-tertiary);grid-column:2;margin:0;font-size:10px}._7RUDUa_reviewCard header>button{min-height:40px;color:var(--dsw-alias-label-secondary);cursor:pointer;background:0 0;border:0;align-items:center;gap:6px;font:600 11px inherit;display:flex}._7RUDUa_reviewBody{border-top:1px solid var(--dsw-alias-border-subtle);grid-template-columns:minmax(0,1.5fr) minmax(300px,.7fr);display:grid}._7RUDUa_reviewBody pre{white-space:pre-wrap;min-height:360px;max-height:560px;margin:0;padding:28px;font:12px/1.8 ui-monospace,SFMono-Regular,monospace;overflow:auto}._7RUDUa_reviewForm{border-left:1px solid var(--dsw-alias-border-subtle);background:var(--dsw-alias-bg-layer-2);flex-direction:column;padding:24px;display:flex}._7RUDUa_reviewForm label{margin-bottom:10px;font-size:11px;font-weight:600}._7RUDUa_reviewForm textarea{resize:vertical;border:1px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-base);min-height:180px;color:inherit;border-radius:7px;padding:12px;font:12px/1.6 inherit}._7RUDUa_reviewForm>div{justify-content:flex-end;gap:8px;margin-top:14px;display:flex}._7RUDUa_alert{border:1px solid var(--dsw-alias-state-error-primary);background:var(--dsw-alias-state-error-secondary);width:min(1180px,100%);min-height:48px;color:var(--dsw-alias-label-error);grid-template-columns:20px 1fr auto;align-items:center;gap:10px;margin:0 auto 20px;padding:10px 14px;font-size:11px;display:grid}._7RUDUa_alert button{color:inherit;cursor:pointer;background:0 0;border:0;font:600 10px inherit}._7RUDUa_emptyBlock{text-align:center;flex-direction:column;justify-content:center;align-items:center;min-height:210px;display:flex}._7RUDUa_emptyBlock>span{background:var(--dsw-alias-bg-layer-3);width:46px;height:46px;color:var(--dsw-alias-label-tertiary);border-radius:50%;place-items:center;display:grid}._7RUDUa_emptyBlock strong{margin-top:14px;font-size:12px}._7RUDUa_emptyBlock p{max-width:380px;color:var(--dsw-alias-label-tertiary);margin:7px 0 0;font-size:10px;line-height:1.6}._7RUDUa_loading{grid-template-columns:repeat(3,1fr);gap:20px;width:min(1180px,100%);margin:0 auto;display:grid}._7RUDUa_loading span{background:var(--dsw-alias-bg-skeleton);height:160px;animation:1.4s ease-in-out infinite _7RUDUa_pulse}._7RUDUa_noMatter{text-align:center;max-width:680px;margin:16vh auto 0}._7RUDUa_largeMark{width:52px;height:52px;margin:0 auto 24px;font-size:28px}._7RUDUa_noMatter h1{margin:12px 0;font:600 36px/1.25 Georgia,Songti SC,serif}._7RUDUa_noMatter p{color:var(--dsw-alias-label-secondary);margin:0 auto 24px;font-size:13px;line-height:1.7}._7RUDUa_sheetBackdrop{z-index:10001;background:var(--dsw-alias-bg-mask-2);justify-content:flex-end;display:flex;position:fixed;inset:0}._7RUDUa_sheet{background:var(--dsw-alias-bg-layer-1);flex-direction:column;width:min(480px,100%);height:100%;animation:.22s ease-out _7RUDUa_slideIn;display:flex;box-shadow:-16px 0 48px #0000002e}._7RUDUa_sheet>header{border-bottom:1px solid var(--dsw-alias-border-subtle);justify-content:space-between;align-items:center;height:88px;padding:0 28px;display:flex}._7RUDUa_sheet header span{letter-spacing:.14em;color:var(--dsw-alias-label-tertiary);font-size:9px}._7RUDUa_sheet h2{margin:5px 0 0;font:600 23px Georgia,Songti SC,serif}._7RUDUa_sheet header button{width:44px;height:44px;color:inherit;cursor:pointer;background:0 0;border:0;border-radius:8px;place-items:center;display:grid}._7RUDUa_sheet header button:hover{background:var(--dsw-alias-interactive-bg-hover)}._7RUDUa_formBody{flex-direction:column;flex:1;padding:32px 28px;display:flex}._7RUDUa_formBody label{margin:0 0 8px;font-size:12px;font-weight:600}._7RUDUa_formBody label:not(:first-child){margin-top:24px}._7RUDUa_formBody label span{color:var(--dsw-alias-label-error);margin-left:3px}._7RUDUa_formBody input{border:1px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-base);height:46px;color:inherit;border-radius:7px;padding:0 12px;font:13px inherit}._7RUDUa_formBody small{color:var(--dsw-alias-label-tertiary);margin-top:7px;font-size:10px}._7RUDUa_sheet>footer{border-top:1px solid var(--dsw-alias-border-subtle);justify-content:flex-end;align-items:center;gap:10px;height:80px;padding:0 28px;display:flex}@keyframes _7RUDUa_pulse{0%,to{opacity:.45}50%{opacity:1}}@keyframes _7RUDUa_slideIn{0%{opacity:0;transform:translate(24px)}to{opacity:1;transform:translate(0)}}@media (prefers-reduced-motion:reduce){*{transition:none!important;animation:none!important}}@media (width<=1000px){._7RUDUa_app{grid-template-columns:210px minmax(0,1fr)}._7RUDUa_rail{padding-inline:12px}._7RUDUa_content{padding-inline:28px}._7RUDUa_metrics{grid-template-columns:repeat(2,1fr)}._7RUDUa_metric:nth-child(2){border-right:0}._7RUDUa_metric:nth-child(-n+2){border-bottom:1px solid var(--dsw-alias-border-subtle)}._7RUDUa_overviewGrid{grid-template-columns:1fr}._7RUDUa_agentRow{grid-template-columns:32px 42px 1fr 130px}._7RUDUa_agentMeta{display:none}._7RUDUa_snapshotList{grid-template-columns:1fr 1fr}._7RUDUa_materialRow{grid-template-columns:20px 36px minmax(160px,1fr) 90px}._7RUDUa_materialRow>._7RUDUa_hash{display:none}._7RUDUa_tableHeader,._7RUDUa_runTableRow{grid-template-columns:1fr 1.2fr 80px 90px}._7RUDUa_tableHeader span:nth-child(3),._7RUDUa_runTableRow>span:nth-child(3){display:none}._7RUDUa_reviewBody{grid-template-columns:1fr}._7RUDUa_reviewForm{border-left:0;border-top:1px solid var(--dsw-alias-border-subtle)}}@media (width<=700px){._7RUDUa_app{grid-template-columns:1fr}._7RUDUa_rail{z-index:2;border-right:0;border-top:1px solid var(--dsw-alias-border-subtle);grid-template-columns:1fr 48px;height:66px;min-height:0;padding:8px 12px;display:grid;position:fixed;bottom:0;left:0;right:0}._7RUDUa_brand,._7RUDUa_caseDirectory{display:none}._7RUDUa_nav{border:0;grid-template-columns:repeat(5,1fr);gap:2px;padding:0;display:grid}._7RUDUa_navItem{text-align:center;flex-direction:column;justify-content:center;gap:2px;min-height:48px;padding:2px;font-size:9px;display:flex}._7RUDUa_navItem small,._7RUDUa_navActive:before{display:none}._7RUDUa_backHarness{justify-content:center;min-height:48px;padding:0}._7RUDUa_backHarness span{display:none}._7RUDUa_topbar{height:60px;padding:0 16px}._7RUDUa_context span,._7RUDUa_context small,._7RUDUa_localStatus{display:none}._7RUDUa_content{padding:28px 16px 96px}._7RUDUa_pageHeading{flex-direction:column;align-items:flex-start;margin-bottom:24px}._7RUDUa_pageHeading h1{font-size:28px}._7RUDUa_metrics{grid-template-columns:1fr 1fr}._7RUDUa_metric{min-height:112px;padding:18px}._7RUDUa_primaryPanel{flex-direction:column;align-items:flex-start;padding:24px}._7RUDUa_snapshotList,._7RUDUa_snapshotChooser{grid-template-columns:1fr}._7RUDUa_snapshotChooser small{grid-column:1}._7RUDUa_agentRow{grid-template-columns:32px 42px 1fr;padding:20px 16px}._7RUDUa_agentRow ._7RUDUa_primaryButton{grid-column:2/4;width:100%}._7RUDUa_materialRow{grid-template-columns:20px 36px 1fr}._7RUDUa_materialRow>span:nth-last-child(2),._7RUDUa_tableHeader{display:none}._7RUDUa_runTableRow{grid-template-columns:1fr auto;gap:10px;padding:14px 0}._7RUDUa_runTableRow code,._7RUDUa_runTableRow>span:nth-child(3){display:none}._7RUDUa_sheet{width:100%}}";
		const tagId = "@civright/legaldesk-harness/workbench.module.css";
		if (typeof document !== "undefined" && document.querySelector("style[data-plugin-css=" + JSON.stringify(tagId) + "]") === null) {
			const tag = document.createElement("style");
			tag.dataset.plugin = "@civright/legaldesk-harness";
			tag.dataset.pluginCss = tagId;
			tag.textContent = css;
			document.head.appendChild(tag);
		}
		var workbench_module_css_default = {
			"agentIndex": "_7RUDUa_agentIndex",
			"agentList": "_7RUDUa_agentList",
			"agentMeta": "_7RUDUa_agentMeta",
			"agentRow": "_7RUDUa_agentRow",
			"agentSymbol": "_7RUDUa_agentSymbol",
			"alert": "_7RUDUa_alert",
			"app": "_7RUDUa_app",
			"backHarness": "_7RUDUa_backHarness",
			"badge": "_7RUDUa_badge",
			"badge_approved": "_7RUDUa_badge_approved",
			"badge_completed": "_7RUDUa_badge_completed",
			"badge_failed": "_7RUDUa_badge_failed",
			"badge_pending_review": "_7RUDUa_badge_pending_review",
			"badge_running": "_7RUDUa_badge_running",
			"brand": "_7RUDUa_brand",
			"brandMark": "_7RUDUa_brandMark",
			"caseActive": "_7RUDUa_caseActive",
			"caseDirectory": "_7RUDUa_caseDirectory",
			"caseInitial": "_7RUDUa_caseInitial",
			"caseItem": "_7RUDUa_caseItem",
			"caseList": "_7RUDUa_caseList",
			"content": "_7RUDUa_content",
			"context": "_7RUDUa_context",
			"directoryHead": "_7RUDUa_directoryHead",
			"divider": "_7RUDUa_divider",
			"emptyBlock": "_7RUDUa_emptyBlock",
			"emptyLine": "_7RUDUa_emptyLine",
			"entry": "_7RUDUa_entry",
			"fileGlyph": "_7RUDUa_fileGlyph",
			"fileName": "_7RUDUa_fileName",
			"formBody": "_7RUDUa_formBody",
			"hash": "_7RUDUa_hash",
			"largeMark": "_7RUDUa_largeMark",
			"loading": "_7RUDUa_loading",
			"localStatus": "_7RUDUa_localStatus",
			"materialRow": "_7RUDUa_materialRow",
			"materialTable": "_7RUDUa_materialTable",
			"metric": "_7RUDUa_metric",
			"metricEmphasis": "_7RUDUa_metricEmphasis",
			"metrics": "_7RUDUa_metrics",
			"nav": "_7RUDUa_nav",
			"navActive": "_7RUDUa_navActive",
			"navItem": "_7RUDUa_navItem",
			"noMatter": "_7RUDUa_noMatter",
			"overviewGrid": "_7RUDUa_overviewGrid",
			"page": "_7RUDUa_page",
			"pageHeading": "_7RUDUa_pageHeading",
			"panelIntro": "_7RUDUa_panelIntro",
			"primaryButton": "_7RUDUa_primaryButton",
			"primaryPanel": "_7RUDUa_primaryPanel",
			"pulse": "_7RUDUa_pulse",
			"rail": "_7RUDUa_rail",
			"reviewBody": "_7RUDUa_reviewBody",
			"reviewCard": "_7RUDUa_reviewCard",
			"reviewForm": "_7RUDUa_reviewForm",
			"reviewList": "_7RUDUa_reviewList",
			"runError": "_7RUDUa_runError",
			"runSummary": "_7RUDUa_runSummary",
			"runTable": "_7RUDUa_runTable",
			"runTableRow": "_7RUDUa_runTableRow",
			"secondaryButton": "_7RUDUa_secondaryButton",
			"sectionHead": "_7RUDUa_sectionHead",
			"selectedTag": "_7RUDUa_selectedTag",
			"sheet": "_7RUDUa_sheet",
			"sheetBackdrop": "_7RUDUa_sheetBackdrop",
			"skipLink": "_7RUDUa_skipLink",
			"slideIn": "_7RUDUa_slideIn",
			"snapshotActive": "_7RUDUa_snapshotActive",
			"snapshotChooser": "_7RUDUa_snapshotChooser",
			"snapshotIcon": "_7RUDUa_snapshotIcon",
			"snapshotItem": "_7RUDUa_snapshotItem",
			"snapshotList": "_7RUDUa_snapshotList",
			"statusDot": "_7RUDUa_statusDot",
			"stepLabel": "_7RUDUa_stepLabel",
			"surface": "_7RUDUa_surface",
			"tableHeader": "_7RUDUa_tableHeader",
			"tableToolbar": "_7RUDUa_tableToolbar",
			"todo": "_7RUDUa_todo",
			"topbar": "_7RUDUa_topbar",
			"workspace": "_7RUDUa_workspace"
		};
		//#endregion
		//#region lib/types/client/index.js
		const inject = ["slots", "sessions"];
		function apply(ctx) {
			ctx.slots.inject("sidebar.footer.action", () => ctx.slots.register({
				name: "sidebar.footer.action",
				id: "legaldesk-workbench",
				order: -20,
				inject: () => ({ openSession: (id) => ctx.sessions.open(id) })
			}, LegalDeskEntry));
		}
		function LegalDeskEntry({ wide, openSession }) {
			const [open, setOpen] = (0, react.useState)(() => new URLSearchParams(window.location.search).get("legaldesk") === "1");
			return (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [(0, react_jsx_runtime.jsxs)("button", {
				className: workbench_module_css_default.entry,
				type: "button",
				onClick: () => setOpen(true),
				"aria-label": "打开法律工作台",
				children: [(0, react_jsx_runtime.jsx)(ScaleIcon, {}), wide && (0, react_jsx_runtime.jsx)("span", { children: "法律工作台" })]
			}), open && (0, react_dom.createPortal)((0, react_jsx_runtime.jsx)(Workbench, {
				onClose: () => setOpen(false),
				openSession
			}), document.body)] });
		}
		function Workbench({ onClose, openSession }) {
			const [data, setData] = (0, react.useState)({
				agents: [],
				matters: []
			});
			const [matterId, setMatterId] = (0, react.useState)();
			const [section, setSection] = (0, react.useState)("overview");
			const [selected, setSelected] = (0, react.useState)([]);
			const [snapshotId, setSnapshotId] = (0, react.useState)();
			const [busy, setBusy] = (0, react.useState)(false);
			const [loading, setLoading] = (0, react.useState)(true);
			const [message, setMessage] = (0, react.useState)("");
			const [creatingMatter, setCreatingMatter] = (0, react.useState)(false);
			const matter = data.matters.find((item) => item.id === matterId);
			const refresh = async (id = matterId) => {
				const next = await request(`overview${id ? `?matterId=${encodeURIComponent(id)}` : ""}`);
				setData(next);
				if (!id && next.matters[0]) setMatterId(next.matters[0].id);
				setLoading(false);
			};
			(0, react.useEffect)(() => {
				refresh();
			}, []);
			(0, react.useEffect)(() => {
				if (matterId) {
					setSelected([]);
					setSnapshotId(void 0);
					refresh(matterId);
				}
			}, [matterId]);
			(0, react.useEffect)(() => {
				if (!matterId || !data.runs?.some((run) => run.status === "running")) return;
				const timer = window.setInterval(() => {
					refresh(matterId);
				}, 2500);
				return () => window.clearInterval(timer);
			}, [matterId, data.runs]);
			const perform = async (work) => {
				setBusy(true);
				setMessage("");
				try {
					await work();
				} catch (error) {
					setMessage(error instanceof Error ? error.message : String(error));
				} finally {
					setBusy(false);
				}
			};
			return (0, react_jsx_runtime.jsxs)("div", {
				className: workbench_module_css_default.app,
				role: "dialog",
				"aria-modal": "true",
				"aria-label": "法律工作台",
				children: [
					(0, react_jsx_runtime.jsx)("a", {
						className: workbench_module_css_default.skipLink,
						href: "#legaldesk-main",
						children: "跳到主要内容"
					}),
					(0, react_jsx_runtime.jsxs)("aside", {
						className: workbench_module_css_default.rail,
						children: [
							(0, react_jsx_runtime.jsxs)("div", {
								className: workbench_module_css_default.brand,
								children: [(0, react_jsx_runtime.jsx)("span", {
									className: workbench_module_css_default.brandMark,
									children: "L"
								}), (0, react_jsx_runtime.jsxs)("span", { children: [(0, react_jsx_runtime.jsx)("strong", { children: "LegalDesk" }), (0, react_jsx_runtime.jsx)("small", { children: "法律 Agent 工作台" })] })]
							}),
							(0, react_jsx_runtime.jsxs)("nav", {
								className: workbench_module_css_default.nav,
								"aria-label": "法律工作台导航",
								children: [
									(0, react_jsx_runtime.jsx)(NavButton, {
										active: section === "overview",
										icon: (0, react_jsx_runtime.jsx)(GridIcon, {}),
										label: "案件概览",
										onClick: () => setSection("overview")
									}),
									(0, react_jsx_runtime.jsx)(NavButton, {
										active: section === "materials",
										icon: (0, react_jsx_runtime.jsx)(FileIcon, {}),
										label: "材料与快照",
										count: data.materials?.length,
										onClick: () => setSection("materials")
									}),
									(0, react_jsx_runtime.jsx)(NavButton, {
										active: section === "agents",
										icon: (0, react_jsx_runtime.jsx)(AgentIcon, {}),
										label: "法律 Agent",
										onClick: () => setSection("agents")
									}),
									(0, react_jsx_runtime.jsx)(NavButton, {
										active: section === "runs",
										icon: (0, react_jsx_runtime.jsx)(RunIcon, {}),
										label: "运行记录",
										count: data.runs?.length,
										onClick: () => setSection("runs")
									}),
									(0, react_jsx_runtime.jsx)(NavButton, {
										active: section === "review",
										icon: (0, react_jsx_runtime.jsx)(ReviewIcon, {}),
										label: "草稿审核",
										count: data.artifacts?.filter((item) => item.status === "pending_review").length,
										onClick: () => setSection("review")
									})
								]
							}),
							(0, react_jsx_runtime.jsxs)("div", {
								className: workbench_module_css_default.caseDirectory,
								children: [(0, react_jsx_runtime.jsxs)("div", {
									className: workbench_module_css_default.directoryHead,
									children: [(0, react_jsx_runtime.jsx)("span", { children: "案件" }), (0, react_jsx_runtime.jsx)("button", {
										type: "button",
										onClick: () => setCreatingMatter(true),
										"aria-label": "新建案件",
										children: (0, react_jsx_runtime.jsx)(PlusIcon, {})
									})]
								}), (0, react_jsx_runtime.jsx)("div", {
									className: workbench_module_css_default.caseList,
									children: data.matters.map((item) => (0, react_jsx_runtime.jsxs)("button", {
										type: "button",
										className: `${workbench_module_css_default.caseItem} ${item.id === matterId ? workbench_module_css_default.caseActive : ""}`,
										onClick: () => {
											setMatterId(item.id);
											setSection("overview");
										},
										children: [(0, react_jsx_runtime.jsx)("span", {
											className: workbench_module_css_default.caseInitial,
											children: item.title.slice(0, 1)
										}), (0, react_jsx_runtime.jsxs)("span", { children: [(0, react_jsx_runtime.jsx)("strong", { children: item.title }), (0, react_jsx_runtime.jsxs)("small", { children: [
											item.material_count,
											" 份材料 · ",
											item.run_count,
											" 次运行"
										] })] })]
									}, item.id))
								})]
							}),
							(0, react_jsx_runtime.jsxs)("button", {
								className: workbench_module_css_default.backHarness,
								type: "button",
								onClick: onClose,
								"aria-label": "返回 Harness",
								children: [(0, react_jsx_runtime.jsx)(BackIcon, {}), (0, react_jsx_runtime.jsx)("span", { children: "返回 Harness" })]
							})
						]
					}),
					(0, react_jsx_runtime.jsxs)("section", {
						className: workbench_module_css_default.workspace,
						children: [(0, react_jsx_runtime.jsxs)("header", {
							className: workbench_module_css_default.topbar,
							children: [(0, react_jsx_runtime.jsxs)("div", {
								className: workbench_module_css_default.context,
								children: [
									(0, react_jsx_runtime.jsx)("span", { children: "当前案件" }),
									(0, react_jsx_runtime.jsx)("strong", { children: matter?.title ?? "未选择案件" }),
									matter?.reference_no && (0, react_jsx_runtime.jsx)("small", { children: matter.reference_no })
								]
							}), (0, react_jsx_runtime.jsxs)("div", {
								className: workbench_module_css_default.localStatus,
								children: [
									(0, react_jsx_runtime.jsx)("span", { className: workbench_module_css_default.statusDot }),
									"本机存储",
									(0, react_jsx_runtime.jsx)("span", { className: workbench_module_css_default.divider }),
									"人工审核开启"
								]
							})]
						}), (0, react_jsx_runtime.jsxs)("main", {
							className: workbench_module_css_default.content,
							id: "legaldesk-main",
							tabIndex: -1,
							children: [message && (0, react_jsx_runtime.jsxs)("div", {
								className: workbench_module_css_default.alert,
								role: "alert",
								children: [
									(0, react_jsx_runtime.jsx)(AlertIcon, {}),
									(0, react_jsx_runtime.jsx)("span", { children: message }),
									(0, react_jsx_runtime.jsx)("button", {
										type: "button",
										onClick: () => setMessage(""),
										children: "关闭"
									})
								]
							}), loading ? (0, react_jsx_runtime.jsx)(LoadingState, {}) : !matter ? (0, react_jsx_runtime.jsx)(NoMatter, { onCreate: () => setCreatingMatter(true) }) : (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [
								section === "overview" && (0, react_jsx_runtime.jsx)(OverviewPage, {
									matter,
									data,
									go: setSection
								}),
								section === "materials" && (0, react_jsx_runtime.jsx)(MaterialsPage, {
									data,
									matterId: matter.id,
									selected,
									setSelected,
									snapshotId,
									setSnapshotId,
									busy,
									perform,
									refresh: () => refresh(matter.id)
								}),
								section === "agents" && (0, react_jsx_runtime.jsx)(AgentsPage, {
									data,
									matterId: matter.id,
									snapshotId,
									setSnapshotId,
									busy,
									perform,
									refresh: () => refresh(matter.id)
								}),
								section === "runs" && (0, react_jsx_runtime.jsx)(RunsPage, {
									data,
									openSession
								}),
								section === "review" && (0, react_jsx_runtime.jsx)(ReviewPage, {
									data,
									busy,
									perform,
									refresh: () => refresh(matter.id)
								})
							] })]
						})]
					}),
					creatingMatter && (0, react_jsx_runtime.jsx)(MatterForm, {
						busy,
						onCancel: () => setCreatingMatter(false),
						onSubmit: (title, referenceNo) => perform(async () => {
							const row = await request("matters", {
								title,
								referenceNo
							});
							await refresh();
							setMatterId(row.id);
							setCreatingMatter(false);
							setSection("overview");
						})
					})
				]
			});
		}
		function OverviewPage({ matter, data, go }) {
			const pending = data.artifacts?.filter((item) => item.status === "pending_review").length ?? 0;
			const lastRun = data.runs?.[0];
			const next = (data.materials?.length ?? 0) === 0 ? "materials" : (data.snapshots?.length ?? 0) === 0 ? "materials" : "agents";
			return (0, react_jsx_runtime.jsxs)("div", {
				className: workbench_module_css_default.page,
				children: [
					(0, react_jsx_runtime.jsx)(PageHeading, {
						eyebrow: "案件工作空间",
						title: matter.title,
						description: "案件材料、Agent 运行与审核记录均隔离保存在当前案件边界内。"
					}),
					(0, react_jsx_runtime.jsxs)("div", {
						className: workbench_module_css_default.metrics,
						children: [
							(0, react_jsx_runtime.jsx)(Metric, {
								value: data.materials?.length ?? 0,
								label: "案件材料",
								hint: "已导入本机"
							}),
							(0, react_jsx_runtime.jsx)(Metric, {
								value: data.snapshots?.length ?? 0,
								label: "材料快照",
								hint: "不可变版本"
							}),
							(0, react_jsx_runtime.jsx)(Metric, {
								value: data.runs?.length ?? 0,
								label: "Agent 运行",
								hint: lastRun ? statusText(lastRun.status) : "尚未运行"
							}),
							(0, react_jsx_runtime.jsx)(Metric, {
								value: pending,
								label: "待审核草稿",
								hint: pending ? "需要律师处理" : "当前无待办",
								emphasis: pending > 0
							})
						]
					}),
					(0, react_jsx_runtime.jsxs)("section", {
						className: workbench_module_css_default.primaryPanel,
						children: [(0, react_jsx_runtime.jsxs)("div", {
							className: workbench_module_css_default.panelIntro,
							children: [
								(0, react_jsx_runtime.jsx)("span", {
									className: workbench_module_css_default.stepLabel,
									children: "建议下一步"
								}),
								(0, react_jsx_runtime.jsx)("h2", { children: next === "agents" ? "选择法律 Agent 开始工作" : (data.materials?.length ?? 0) === 0 ? "导入第一份案件材料" : "固化本次工作材料快照" }),
								(0, react_jsx_runtime.jsx)("p", { children: "Agent 只会收到你明确纳入快照的材料，运行结果不会自动成为最终法律意见。" })
							]
						}), (0, react_jsx_runtime.jsxs)("button", {
							className: workbench_module_css_default.primaryButton,
							type: "button",
							onClick: () => go(next),
							children: ["继续办理", (0, react_jsx_runtime.jsx)(ArrowIcon, {})]
						})]
					}),
					(0, react_jsx_runtime.jsxs)("div", {
						className: workbench_module_css_default.overviewGrid,
						children: [(0, react_jsx_runtime.jsxs)("section", {
							className: workbench_module_css_default.surface,
							children: [(0, react_jsx_runtime.jsx)(SectionHead, {
								title: "最近运行",
								action: "查看全部",
								onAction: () => go("runs")
							}), lastRun ? (0, react_jsx_runtime.jsx)(RunSummary, {
								run: lastRun,
								agents: data.agents
							}) : (0, react_jsx_runtime.jsx)(EmptyLine, { text: "尚未启动法律 Agent" })]
						}), (0, react_jsx_runtime.jsxs)("section", {
							className: workbench_module_css_default.surface,
							children: [(0, react_jsx_runtime.jsx)(SectionHead, {
								title: "审核待办",
								action: "进入审核",
								onAction: () => go("review")
							}), pending ? (0, react_jsx_runtime.jsxs)("div", {
								className: workbench_module_css_default.todo,
								children: [(0, react_jsx_runtime.jsx)("span", { children: pending }), (0, react_jsx_runtime.jsxs)("div", { children: [(0, react_jsx_runtime.jsx)("strong", { children: "份草稿等待人工审核" }), (0, react_jsx_runtime.jsx)("small", { children: "批准或退回修改后才会完成审核闭环" })] })]
							}) : (0, react_jsx_runtime.jsx)(EmptyLine, { text: "当前没有待审核草稿" })]
						})]
					})
				]
			});
		}
		function MaterialsPage({ data, matterId, selected, setSelected, snapshotId, setSnapshotId, busy, perform, refresh }) {
			return (0, react_jsx_runtime.jsxs)("div", {
				className: workbench_module_css_default.page,
				children: [
					(0, react_jsx_runtime.jsx)(PageHeading, {
						eyebrow: "案件材料",
						title: "材料与快照",
						description: "导入材料后，明确选择本次工作范围并固化不可变快照。",
						actions: (0, react_jsx_runtime.jsxs)("label", {
							className: workbench_module_css_default.primaryButton,
							children: ["导入材料", (0, react_jsx_runtime.jsx)("input", {
								type: "file",
								multiple: true,
								onChange: (event) => void perform(async () => {
									const files = Array.from(event.target.files ?? []);
									for (const file of files) await request("materials", {
										matterId,
										name: file.name,
										mediaType: file.type,
										data: await fileBase64(file)
									});
									event.target.value = "";
									await refresh();
								})
							})]
						})
					}),
					(0, react_jsx_runtime.jsxs)("section", {
						className: workbench_module_css_default.surface,
						children: [(0, react_jsx_runtime.jsxs)("div", {
							className: workbench_module_css_default.tableToolbar,
							children: [(0, react_jsx_runtime.jsxs)("div", { children: [(0, react_jsx_runtime.jsxs)("strong", { children: [data.materials?.length ?? 0, " 份材料"] }), (0, react_jsx_runtime.jsxs)("span", { children: [
								"已选 ",
								selected.length,
								" 份"
							] })] }), (0, react_jsx_runtime.jsx)("button", {
								className: workbench_module_css_default.secondaryButton,
								type: "button",
								disabled: busy || selected.length === 0,
								onClick: () => void perform(async () => {
									const snap = await request("snapshots", {
										matterId,
										materialIds: selected
									});
									await refresh();
									setSnapshotId(snap.id);
								}),
								children: "创建材料快照"
							})]
						}), (0, react_jsx_runtime.jsxs)("div", {
							className: workbench_module_css_default.materialTable,
							role: "table",
							"aria-label": "案件材料",
							children: [(data.materials ?? []).map((item) => (0, react_jsx_runtime.jsxs)("label", {
								className: workbench_module_css_default.materialRow,
								children: [
									(0, react_jsx_runtime.jsx)("input", {
										type: "checkbox",
										checked: selected.includes(item.id),
										onChange: () => setSelected((list) => list.includes(item.id) ? list.filter((id) => id !== item.id) : [...list, item.id])
									}),
									(0, react_jsx_runtime.jsx)("span", {
										className: workbench_module_css_default.fileGlyph,
										children: (0, react_jsx_runtime.jsx)(FileIcon, {})
									}),
									(0, react_jsx_runtime.jsxs)("span", {
										className: workbench_module_css_default.fileName,
										children: [(0, react_jsx_runtime.jsx)("strong", { children: item.name }), (0, react_jsx_runtime.jsxs)("small", { children: [
											item.media_type || "未知类型",
											" · ",
											parseText(item)
										] })]
									}),
									(0, react_jsx_runtime.jsxs)("span", { children: [(0, react_jsx_runtime.jsx)("strong", { children: formatBytes(item.byte_size) }), (0, react_jsx_runtime.jsx)("small", { children: "文件大小" })] }),
									(0, react_jsx_runtime.jsxs)("span", {
										className: workbench_module_css_default.hash,
										children: [(0, react_jsx_runtime.jsxs)("code", { children: [item.sha256.slice(0, 12), "…"] }), (0, react_jsx_runtime.jsx)("small", { children: "SHA-256" })]
									})
								]
							}, item.id)), (data.materials ?? []).length === 0 && (0, react_jsx_runtime.jsx)(EmptyBlock, {
								title: "尚无案件材料",
								description: "导入合同、证据清单或事实说明，文件会复制到本机受管目录。"
							})]
						})]
					}),
					(0, react_jsx_runtime.jsxs)("section", {
						className: workbench_module_css_default.surface,
						children: [(0, react_jsx_runtime.jsx)(SectionHead, { title: "材料快照" }), (0, react_jsx_runtime.jsx)("div", {
							className: workbench_module_css_default.snapshotList,
							children: (data.snapshots ?? []).map((item) => (0, react_jsx_runtime.jsxs)("button", {
								type: "button",
								className: `${workbench_module_css_default.snapshotItem} ${snapshotId === item.id ? workbench_module_css_default.snapshotActive : ""}`,
								onClick: () => setSnapshotId(item.id),
								children: [
									(0, react_jsx_runtime.jsx)("span", {
										className: workbench_module_css_default.snapshotIcon,
										children: (0, react_jsx_runtime.jsx)(SnapshotIcon, {})
									}),
									(0, react_jsx_runtime.jsxs)("span", { children: [(0, react_jsx_runtime.jsx)("strong", { children: item.label }), (0, react_jsx_runtime.jsxs)("small", { children: [
										item.material_count,
										" 份材料 · ",
										formatDate(item.created_at)
									] })] }),
									snapshotId === item.id && (0, react_jsx_runtime.jsx)("span", {
										className: workbench_module_css_default.selectedTag,
										children: "已选"
									})
								]
							}, item.id))
						})]
					})
				]
			});
		}
		function AgentsPage({ data, matterId, snapshotId, setSnapshotId, busy, perform, refresh }) {
			return (0, react_jsx_runtime.jsxs)("div", {
				className: workbench_module_css_default.page,
				children: [
					(0, react_jsx_runtime.jsx)(PageHeading, {
						eyebrow: "受控工作流",
						title: "法律 Agent",
						description: "选择一个材料快照和专业角色。每次启动都会创建独立 Harness Session。"
					}),
					(0, react_jsx_runtime.jsxs)("div", {
						className: workbench_module_css_default.snapshotChooser,
						children: [
							(0, react_jsx_runtime.jsx)("label", {
								htmlFor: "run-snapshot",
								children: "运行材料快照"
							}),
							(0, react_jsx_runtime.jsxs)("select", {
								id: "run-snapshot",
								value: snapshotId ?? "",
								onChange: (event) => setSnapshotId(event.target.value || void 0),
								children: [(0, react_jsx_runtime.jsx)("option", {
									value: "",
									children: "请选择已固化的材料快照"
								}), (data.snapshots ?? []).map((item) => (0, react_jsx_runtime.jsxs)("option", {
									value: item.id,
									children: [
										item.label,
										" · ",
										item.material_count,
										" 份材料"
									]
								}, item.id))]
							}),
							(0, react_jsx_runtime.jsx)("small", { children: snapshotId ? "Agent 将只能读取该快照中的材料。" : "必须先选择快照，才能启动 Agent。" })
						]
					}),
					(0, react_jsx_runtime.jsx)("div", {
						className: workbench_module_css_default.agentList,
						children: data.agents.map((agent, index) => (0, react_jsx_runtime.jsxs)("article", {
							className: workbench_module_css_default.agentRow,
							children: [
								(0, react_jsx_runtime.jsxs)("span", {
									className: workbench_module_css_default.agentIndex,
									children: ["0", index + 1]
								}),
								(0, react_jsx_runtime.jsx)("span", {
									className: workbench_module_css_default.agentSymbol,
									children: index === 0 ? (0, react_jsx_runtime.jsx)(OrganizeIcon, {}) : index === 1 ? (0, react_jsx_runtime.jsx)(EvidenceIcon, {}) : (0, react_jsx_runtime.jsx)(DraftIcon, {})
								}),
								(0, react_jsx_runtime.jsxs)("div", { children: [(0, react_jsx_runtime.jsx)("h2", { children: agent.name }), (0, react_jsx_runtime.jsx)("p", { children: agent.description })] }),
								(0, react_jsx_runtime.jsxs)("div", {
									className: workbench_module_css_default.agentMeta,
									children: [(0, react_jsx_runtime.jsx)("span", { children: "独立 Session" }), (0, react_jsx_runtime.jsx)("span", { children: "输出需人工审核" })]
								}),
								(0, react_jsx_runtime.jsxs)("button", {
									className: workbench_module_css_default.primaryButton,
									type: "button",
									disabled: busy || !snapshotId,
									onClick: () => void perform(async () => {
										await request("runs", {
											matterId,
											snapshotId,
											agentKey: agent.key
										});
										await refresh();
									}),
									children: [busy ? "正在启动…" : "启动 Agent", (0, react_jsx_runtime.jsx)(ArrowIcon, {})]
								})
							]
						}, agent.key))
					})
				]
			});
		}
		function RunsPage({ data, openSession }) {
			return (0, react_jsx_runtime.jsxs)("div", {
				className: workbench_module_css_default.page,
				children: [(0, react_jsx_runtime.jsx)(PageHeading, {
					eyebrow: "执行与追踪",
					title: "运行记录",
					description: "Legal Run 与 Harness Session 一一关联，并记录模型、Token 与可配置成本估算。"
				}), (0, react_jsx_runtime.jsx)("section", {
					className: workbench_module_css_default.surface,
					children: (0, react_jsx_runtime.jsxs)("div", {
						className: workbench_module_css_default.runTable,
						children: [
							(0, react_jsx_runtime.jsxs)("div", {
								className: workbench_module_css_default.tableHeader,
								children: [
									(0, react_jsx_runtime.jsx)("span", { children: "法律 Agent" }),
									(0, react_jsx_runtime.jsx)("span", { children: "Harness Session" }),
									(0, react_jsx_runtime.jsx)("span", { children: "用量 / 创建时间" }),
									(0, react_jsx_runtime.jsx)("span", { children: "状态" }),
									(0, react_jsx_runtime.jsx)("span", {})
								]
							}),
							(data.runs ?? []).map((run) => (0, react_jsx_runtime.jsxs)("div", {
								className: workbench_module_css_default.runTableRow,
								children: [
									(0, react_jsx_runtime.jsxs)("span", { children: [(0, react_jsx_runtime.jsx)("strong", { children: agentName(data.agents, run.agent_key) }), (0, react_jsx_runtime.jsx)("small", { children: run.model ? `${run.provider || "provider"} · ${run.model}` : `${run.id.slice(0, 20)}…` })] }),
									(0, react_jsx_runtime.jsx)("code", { children: run.harness_session_id }),
									(0, react_jsx_runtime.jsxs)("span", { children: [(0, react_jsx_runtime.jsx)("strong", { children: runUsage(run) }), (0, react_jsx_runtime.jsx)("small", { children: formatDate(run.created_at) })] }),
									(0, react_jsx_runtime.jsx)(StatusBadge, { status: run.status }),
									(0, react_jsx_runtime.jsxs)("button", {
										type: "button",
										onClick: () => openSession(run.harness_session_id),
										children: ["打开 Session", (0, react_jsx_runtime.jsx)(ArrowIcon, {})]
									}),
									run.error && (0, react_jsx_runtime.jsx)("p", {
										className: workbench_module_css_default.runError,
										children: run.error
									})
								]
							}, run.id)),
							(data.runs ?? []).length === 0 && (0, react_jsx_runtime.jsx)(EmptyBlock, {
								title: "尚无运行记录",
								description: "选择材料快照和法律 Agent 后，运行会在这里显示。"
							})
						]
					})
				})]
			});
		}
		function ReviewPage({ data, busy, perform, refresh }) {
			return (0, react_jsx_runtime.jsxs)("div", {
				className: workbench_module_css_default.page,
				children: [(0, react_jsx_runtime.jsx)(PageHeading, {
					eyebrow: "人工质量控制",
					title: "草稿审核",
					description: "模型产物默认是待审核草稿；只有人工可以批准或退回修改。"
				}), (0, react_jsx_runtime.jsxs)("div", {
					className: workbench_module_css_default.reviewList,
					children: [(data.artifacts ?? []).map((item) => (0, react_jsx_runtime.jsx)(ArtifactCard, {
						item,
						busy,
						review: (status, note) => perform(async () => {
							await request("reviews", {
								artifactId: item.id,
								status,
								note
							});
							await refresh();
						})
					}, item.id)), (data.artifacts ?? []).length === 0 && (0, react_jsx_runtime.jsx)("section", {
						className: workbench_module_css_default.surface,
						children: (0, react_jsx_runtime.jsx)(EmptyBlock, {
							title: "当前没有草稿",
							description: "Agent 完成工作后，产物会以“待审核”状态出现在这里。"
						})
					})]
				})]
			});
		}
		function ArtifactCard({ item, busy, review }) {
			const [expanded, setExpanded] = (0, react.useState)(false);
			const [note, setNote] = (0, react.useState)("");
			return (0, react_jsx_runtime.jsxs)("article", {
				className: workbench_module_css_default.reviewCard,
				children: [(0, react_jsx_runtime.jsxs)("header", { children: [(0, react_jsx_runtime.jsxs)("div", { children: [
					(0, react_jsx_runtime.jsx)(StatusBadge, { status: item.status }),
					(0, react_jsx_runtime.jsx)("h2", { children: item.title }),
					(0, react_jsx_runtime.jsxs)("p", { children: [
						agentName([], item.agent_key),
						" · Session ",
						item.harness_session_id
					] })
				] }), (0, react_jsx_runtime.jsxs)("button", {
					type: "button",
					onClick: () => setExpanded((value) => !value),
					"aria-expanded": expanded,
					children: [expanded ? "收起草稿" : "展开审核", (0, react_jsx_runtime.jsx)(ChevronIcon, { up: expanded })]
				})] }), expanded && (0, react_jsx_runtime.jsxs)("div", {
					className: workbench_module_css_default.reviewBody,
					children: [(0, react_jsx_runtime.jsx)("pre", { children: item.content }), item.status === "pending_review" && (0, react_jsx_runtime.jsxs)("div", {
						className: workbench_module_css_default.reviewForm,
						children: [
							(0, react_jsx_runtime.jsx)("label", {
								htmlFor: `note-${item.id}`,
								children: "审核意见"
							}),
							(0, react_jsx_runtime.jsx)("textarea", {
								id: `note-${item.id}`,
								value: note,
								onChange: (event) => setNote(event.target.value),
								placeholder: "记录核对结果；退回修改时请说明原因。"
							}),
							(0, react_jsx_runtime.jsxs)("div", { children: [(0, react_jsx_runtime.jsx)("button", {
								className: workbench_module_css_default.secondaryButton,
								disabled: busy || !note.trim(),
								type: "button",
								onClick: () => void review("changes_requested", note),
								children: "退回修改"
							}), (0, react_jsx_runtime.jsx)("button", {
								className: workbench_module_css_default.primaryButton,
								disabled: busy,
								type: "button",
								onClick: () => void review("approved", note),
								children: "批准草稿"
							})] })
						]
					})]
				})]
			});
		}
		function MatterForm({ busy, onCancel, onSubmit }) {
			const [title, setTitle] = (0, react.useState)("");
			const [referenceNo, setReferenceNo] = (0, react.useState)("");
			const valid = title.trim().length > 0;
			return (0, react_jsx_runtime.jsx)("div", {
				className: workbench_module_css_default.sheetBackdrop,
				children: (0, react_jsx_runtime.jsxs)("form", {
					className: workbench_module_css_default.sheet,
					onSubmit: (event) => {
						event.preventDefault();
						if (valid) onSubmit(title, referenceNo);
					},
					children: [
						(0, react_jsx_runtime.jsxs)("header", { children: [(0, react_jsx_runtime.jsxs)("div", { children: [(0, react_jsx_runtime.jsx)("span", { children: "NEW MATTER" }), (0, react_jsx_runtime.jsx)("h2", { children: "新建案件" })] }), (0, react_jsx_runtime.jsx)("button", {
							type: "button",
							onClick: onCancel,
							"aria-label": "关闭新建案件表单",
							children: (0, react_jsx_runtime.jsx)(CloseIcon, {})
						})] }),
						(0, react_jsx_runtime.jsxs)("div", {
							className: workbench_module_css_default.formBody,
							children: [
								(0, react_jsx_runtime.jsxs)("label", {
									htmlFor: "matter-title",
									children: ["案件名称", (0, react_jsx_runtime.jsx)("span", { children: "*" })]
								}),
								(0, react_jsx_runtime.jsx)("input", {
									id: "matter-title",
									autoFocus: true,
									value: title,
									onChange: (event) => setTitle(event.target.value),
									placeholder: "例如：某公司买卖合同纠纷"
								}),
								(0, react_jsx_runtime.jsx)("small", { children: "名称用于本机案件目录和工作台识别。" }),
								(0, react_jsx_runtime.jsx)("label", {
									htmlFor: "matter-reference",
									children: "案件编号"
								}),
								(0, react_jsx_runtime.jsx)("input", {
									id: "matter-reference",
									value: referenceNo,
									onChange: (event) => setReferenceNo(event.target.value),
									placeholder: "可选，例如：2026-民商-001"
								})
							]
						}),
						(0, react_jsx_runtime.jsxs)("footer", { children: [(0, react_jsx_runtime.jsx)("button", {
							className: workbench_module_css_default.secondaryButton,
							type: "button",
							onClick: onCancel,
							children: "取消"
						}), (0, react_jsx_runtime.jsx)("button", {
							className: workbench_module_css_default.primaryButton,
							type: "submit",
							disabled: !valid || busy,
							children: busy ? "正在创建…" : "创建案件"
						})] })
					]
				})
			});
		}
		function NavButton({ active, icon, label, count, onClick }) {
			return (0, react_jsx_runtime.jsxs)("button", {
				type: "button",
				className: `${workbench_module_css_default.navItem} ${active ? workbench_module_css_default.navActive : ""}`,
				"aria-current": active ? "page" : void 0,
				onClick,
				children: [
					icon,
					(0, react_jsx_runtime.jsx)("span", { children: label }),
					count !== void 0 && count > 0 && (0, react_jsx_runtime.jsx)("small", { children: count })
				]
			});
		}
		function PageHeading({ eyebrow, title, description, actions }) {
			return (0, react_jsx_runtime.jsxs)("header", {
				className: workbench_module_css_default.pageHeading,
				children: [(0, react_jsx_runtime.jsxs)("div", { children: [
					(0, react_jsx_runtime.jsx)("span", { children: eyebrow }),
					(0, react_jsx_runtime.jsx)("h1", { children: title }),
					(0, react_jsx_runtime.jsx)("p", { children: description })
				] }), actions]
			});
		}
		function Metric({ value, label, hint, emphasis }) {
			return (0, react_jsx_runtime.jsxs)("div", {
				className: `${workbench_module_css_default.metric} ${emphasis ? workbench_module_css_default.metricEmphasis : ""}`,
				children: [
					(0, react_jsx_runtime.jsx)("strong", { children: value }),
					(0, react_jsx_runtime.jsx)("span", { children: label }),
					(0, react_jsx_runtime.jsx)("small", { children: hint })
				]
			});
		}
		function SectionHead({ title, action, onAction }) {
			return (0, react_jsx_runtime.jsxs)("div", {
				className: workbench_module_css_default.sectionHead,
				children: [(0, react_jsx_runtime.jsx)("h2", { children: title }), action && (0, react_jsx_runtime.jsxs)("button", {
					type: "button",
					onClick: onAction,
					children: [action, (0, react_jsx_runtime.jsx)(ArrowIcon, {})]
				})]
			});
		}
		function RunSummary({ run, agents }) {
			return (0, react_jsx_runtime.jsxs)("div", {
				className: workbench_module_css_default.runSummary,
				children: [
					(0, react_jsx_runtime.jsx)("span", {
						className: workbench_module_css_default.agentSymbol,
						children: (0, react_jsx_runtime.jsx)(RunIcon, {})
					}),
					(0, react_jsx_runtime.jsxs)("div", { children: [(0, react_jsx_runtime.jsx)("strong", { children: agentName(agents, run.agent_key) }), (0, react_jsx_runtime.jsx)("code", { children: run.harness_session_id })] }),
					(0, react_jsx_runtime.jsx)(StatusBadge, { status: run.status })
				]
			});
		}
		function StatusBadge({ status }) {
			return (0, react_jsx_runtime.jsxs)("span", {
				className: `${workbench_module_css_default.badge} ${workbench_module_css_default[`badge_${status}`] ?? ""}`,
				children: [(0, react_jsx_runtime.jsx)("span", {}), statusText(status)]
			});
		}
		function EmptyLine({ text }) {
			return (0, react_jsx_runtime.jsx)("p", {
				className: workbench_module_css_default.emptyLine,
				children: text
			});
		}
		function EmptyBlock({ title, description }) {
			return (0, react_jsx_runtime.jsxs)("div", {
				className: workbench_module_css_default.emptyBlock,
				children: [
					(0, react_jsx_runtime.jsx)("span", { children: (0, react_jsx_runtime.jsx)(FileIcon, {}) }),
					(0, react_jsx_runtime.jsx)("strong", { children: title }),
					(0, react_jsx_runtime.jsx)("p", { children: description })
				]
			});
		}
		function LoadingState() {
			return (0, react_jsx_runtime.jsxs)("div", {
				className: workbench_module_css_default.loading,
				children: [
					(0, react_jsx_runtime.jsx)("span", {}),
					(0, react_jsx_runtime.jsx)("span", {}),
					(0, react_jsx_runtime.jsx)("span", {})
				]
			});
		}
		function NoMatter({ onCreate }) {
			return (0, react_jsx_runtime.jsxs)("div", {
				className: workbench_module_css_default.noMatter,
				children: [
					(0, react_jsx_runtime.jsx)("span", {
						className: workbench_module_css_default.largeMark,
						children: "L"
					}),
					(0, react_jsx_runtime.jsx)("span", { children: "CASE-FIRST WORKFLOW" }),
					(0, react_jsx_runtime.jsx)("h1", { children: "从一个清晰的案件边界开始。" }),
					(0, react_jsx_runtime.jsx)("p", { children: "材料、Agent Session、草稿和审核记录都必须归属于案件。" }),
					(0, react_jsx_runtime.jsxs)("button", {
						className: workbench_module_css_default.primaryButton,
						type: "button",
						onClick: onCreate,
						children: ["新建第一个案件", (0, react_jsx_runtime.jsx)(ArrowIcon, {})]
					})
				]
			});
		}
		async function request(path, body) {
			const response = await fetch(`/legaldesk/api/${path}`, body === void 0 ? void 0 : {
				method: "POST",
				headers: { "content-type": "application/json" },
				body: JSON.stringify(body)
			});
			const value = await response.json();
			if (!response.ok) throw new Error(value?.error?.message ?? `请求失败 (${response.status})`);
			return value;
		}
		function fileBase64(file) {
			return new Promise((resolve, reject) => {
				const reader = new FileReader();
				reader.onerror = () => reject(reader.error);
				reader.onload = () => resolve(String(reader.result).split(",")[1] ?? "");
				reader.readAsDataURL(file);
			});
		}
		function formatBytes(value) {
			return value < 1024 ? `${value} B` : value < 1048576 ? `${(value / 1024).toFixed(1)} KB` : `${(value / 1048576).toFixed(1)} MB`;
		}
		function formatDate(value) {
			return new Intl.DateTimeFormat("zh-CN", {
				month: "2-digit",
				day: "2-digit",
				hour: "2-digit",
				minute: "2-digit"
			}).format(new Date(value));
		}
		function parseText(item) {
			return item.parse_status === "ready" ? `${item.parser} 已解析` : item.parse_status === "failed" ? "正文解析失败" : "文本可直接读取";
		}
		function runUsage(run) {
			if (run.status === "running") return "正在统计";
			if (run.request_count === 0) return "未报告 Token";
			const input = run.input_tokens + run.cache_read_tokens + run.cache_write_tokens;
			const cost = run.estimated_cost_microusd === null ? "未配置价格" : `$${(run.estimated_cost_microusd / 1e6).toFixed(4)}`;
			return `${formatTokens(input)} 输入 · ${formatTokens(run.output_tokens)} 输出 · ${cost}`;
		}
		function formatTokens(value) {
			return value < 1e3 ? String(value) : `${(value / 1e3).toFixed(value < 1e4 ? 1 : 0)}K`;
		}
		function agentName(agents, key) {
			return agents.find((item) => item.key === key)?.name ?? {
				"material-organizer": "材料整理 Agent",
				"evidence-reviewer": "证据审查 Agent",
				"document-drafter": "法律文书 Agent"
			}[key] ?? key;
		}
		function statusText(status) {
			return {
				running: "运行中",
				completed: "已完成",
				failed: "失败",
				pending_review: "待审核",
				approved: "已批准",
				changes_requested: "已退回"
			}[status] ?? status;
		}
		const Icon = ({ children, size = 18 }) => (0, react_jsx_runtime.jsx)("svg", {
			width: size,
			height: size,
			viewBox: "0 0 24 24",
			fill: "none",
			stroke: "currentColor",
			strokeWidth: "1.7",
			strokeLinecap: "round",
			strokeLinejoin: "round",
			"aria-hidden": "true",
			children
		});
		const ScaleIcon = () => (0, react_jsx_runtime.jsx)(Icon, { children: (0, react_jsx_runtime.jsx)("path", { d: "M12 3v18M5 7h14M7 7l-4 7h8L7 7Zm10 0-4 7h8l-4-7ZM8 21h8" }) });
		const GridIcon = () => (0, react_jsx_runtime.jsxs)(Icon, { children: [
			(0, react_jsx_runtime.jsx)("rect", {
				x: "3",
				y: "3",
				width: "7",
				height: "7",
				rx: "1"
			}),
			(0, react_jsx_runtime.jsx)("rect", {
				x: "14",
				y: "3",
				width: "7",
				height: "7",
				rx: "1"
			}),
			(0, react_jsx_runtime.jsx)("rect", {
				x: "3",
				y: "14",
				width: "7",
				height: "7",
				rx: "1"
			}),
			(0, react_jsx_runtime.jsx)("rect", {
				x: "14",
				y: "14",
				width: "7",
				height: "7",
				rx: "1"
			})
		] });
		const FileIcon = () => (0, react_jsx_runtime.jsxs)(Icon, { children: [(0, react_jsx_runtime.jsx)("path", { d: "M6 3h8l4 4v14H6z" }), (0, react_jsx_runtime.jsx)("path", { d: "M14 3v5h5M9 13h6M9 17h6" })] });
		const AgentIcon = () => (0, react_jsx_runtime.jsxs)(Icon, { children: [(0, react_jsx_runtime.jsx)("circle", {
			cx: "12",
			cy: "8",
			r: "3"
		}), (0, react_jsx_runtime.jsx)("path", { d: "M5 20c.8-4 3.1-6 7-6s6.2 2 7 6M4 5l2 1M20 5l-2 1" })] });
		const RunIcon = () => (0, react_jsx_runtime.jsxs)(Icon, { children: [(0, react_jsx_runtime.jsx)("circle", {
			cx: "12",
			cy: "12",
			r: "9"
		}), (0, react_jsx_runtime.jsx)("path", { d: "m10 8 6 4-6 4z" })] });
		const ReviewIcon = () => (0, react_jsx_runtime.jsxs)(Icon, { children: [(0, react_jsx_runtime.jsx)("path", { d: "M6 3h12v18H6zM9 8h6M9 12h6M9 16h3" }), (0, react_jsx_runtime.jsx)("path", { d: "m14 16 1.5 1.5L19 14" })] });
		const PlusIcon = () => (0, react_jsx_runtime.jsx)(Icon, { children: (0, react_jsx_runtime.jsx)("path", { d: "M12 5v14M5 12h14" }) });
		const BackIcon = () => (0, react_jsx_runtime.jsx)(Icon, { children: (0, react_jsx_runtime.jsx)("path", { d: "m15 18-6-6 6-6" }) });
		const ArrowIcon = () => (0, react_jsx_runtime.jsx)(Icon, {
			size: 15,
			children: (0, react_jsx_runtime.jsx)("path", { d: "M5 12h14m-5-5 5 5-5 5" })
		});
		const AlertIcon = () => (0, react_jsx_runtime.jsxs)(Icon, { children: [(0, react_jsx_runtime.jsx)("circle", {
			cx: "12",
			cy: "12",
			r: "9"
		}), (0, react_jsx_runtime.jsx)("path", { d: "M12 8v5M12 17h.01" })] });
		const SnapshotIcon = () => (0, react_jsx_runtime.jsx)(Icon, { children: (0, react_jsx_runtime.jsx)("path", { d: "M5 5h14v14H5zM8 8h8v8H8z" }) });
		const OrganizeIcon = () => (0, react_jsx_runtime.jsxs)(Icon, {
			size: 22,
			children: [(0, react_jsx_runtime.jsx)("path", { d: "M4 5h16M4 12h10M4 19h13" }), (0, react_jsx_runtime.jsx)("circle", {
				cx: "18",
				cy: "12",
				r: "2"
			})]
		});
		const EvidenceIcon = () => (0, react_jsx_runtime.jsxs)(Icon, {
			size: 22,
			children: [(0, react_jsx_runtime.jsx)("circle", {
				cx: "10",
				cy: "10",
				r: "6"
			}), (0, react_jsx_runtime.jsx)("path", { d: "m15 15 5 5M7 10l2 2 4-4" })]
		});
		const DraftIcon = () => (0, react_jsx_runtime.jsx)(Icon, {
			size: 22,
			children: (0, react_jsx_runtime.jsx)("path", { d: "M5 3h10l4 4v14H5zM15 3v5h5M9 13h6M9 17h4" })
		});
		const ChevronIcon = ({ up }) => (0, react_jsx_runtime.jsx)(Icon, {
			size: 15,
			children: (0, react_jsx_runtime.jsx)("path", { d: up ? "m6 15 6-6 6 6" : "m6 9 6 6 6-6" })
		});
		const CloseIcon = () => (0, react_jsx_runtime.jsx)(Icon, { children: (0, react_jsx_runtime.jsx)("path", { d: "m6 6 12 12M18 6 6 18" }) });
		//#endregion
		exports.apply = apply;
		exports.inject = inject;
		return module.exports;
	}
});

//# sourceMappingURL=client.js.map