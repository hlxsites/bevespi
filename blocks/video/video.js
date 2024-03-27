import { loadScript } from '../../scripts/scripts.js';

export default function decorate(block) {
  const playerID = block.querySelector('div:nth-of-type(1) > div:nth-of-type(2)')?.textContent;
  const entryID = block.querySelector('div:nth-of-type(2) > div:nth-of-type(2)')?.textContent;
  [...block.querySelectorAll('div:nth-of-type(-n+2)')].forEach((div) => div.remove());

  const tagDiv = document.createElement('div');
  tagDiv.classList.add('video-player');
  const tagDivId = `kaltura_player_${playerID}`;
  tagDiv.id = tagDivId;
  block.append(tagDiv);

  let uiConfId = 30355282;
  if (block.classList.contains('keep-same-video-interface-on-mobile')) {
    uiConfId = 30358591;
  }

  window.setTimeout(() => {
    loadScript('https://cdnapisec.kaltura.com/p/432521/sp/43252100/embedIframeJs/uiconf_id/30355282/partner_id/432521', () => {
      // eslint-disable-next-line
      kWidget.embed({
        targetId: tagDivId,
        wid: '_432521',
        uiconf_id: uiConfId,
        flashvars: {},
        cache_st: playerID,
        entry_id: entryID,
      });
    });
  }, 3200);
}
