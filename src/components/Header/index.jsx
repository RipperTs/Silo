import { useRequest } from 'ahooks';
import { useEffect, useRef, useState } from 'react';
import { useActiveModels, useIsRowMode } from '@src/store/app';
import { useLocalStorageAtom, useZenMode } from '@src/store/storage';
import { fetchUserInfo } from '@src/services/api';
import { useDarkMode, useIsMobile } from '@src/utils/use';
import CustomModelDrawer from './CustomModelDrawer';
import { message, notification, Button } from 'tdesign-react';
import { Dropdown } from 'tdesign-react';
import CopyToClipboard from 'react-copy-to-clipboard';
import { useNavigate, useLocation } from 'react-router-dom';
import Tooltip from '@src/components/MobileCompatible/Tooltip';
import { useTranslation } from 'react-i18next';
import ConfigImportModal from './ConfigImportModal';
import { exportConfig, isBrowserExtension } from '@src/utils/utils';
import SecretKeyPopup from './SecretKeyPopup';
import { GUIDE_STEP, LOCAL_STORAGE_KEY } from '@src/utils/types';
import Guide from '@src/components/Guide';
import { i18nOptions } from '@src/i18n/resources';
import MobileModelSelector from './MobileModelSelector';
import WebCopilotSettingsModal from './WebCopilotSettingsModal';

export default function () {
  const secretKeyPopupRef = useRef(null);
  const configModalRef = useRef(null);
  const openConfigModal = () => {
    configModalRef.current.open();
  };

  const [isDark, setDarkMode] = useDarkMode();
  const { i18n, t } = useTranslation();

  const location = useLocation();
  const isImageMode = location.pathname === '/image';
  const [showGuide, setShowGuide] = useState(false);

  const customModelRef = useRef();
  const { data: userInfoRes, runAsync: getUserData } = useRequest(
    fetchUserInfo,
    {
      pollingInterval: 60 * 1000,
      debounceWait: 300,
      manual: true,
    }
  );

  const userData = userInfoRes?.data;

  const [noGuide, setNoGuide] = useLocalStorageAtom(
    LOCAL_STORAGE_KEY.FLAG_NO_GUIDE
  );
  const isMobile = useIsMobile();

  useEffect(() => {
    // 不显示引导：移动端、生图模式、密钥不可用、已关闭引导
    if (isMobile || noGuide || isImageMode || !userData) {
      setShowGuide(false);
      return;
    }
    if (!secretKeyPopupRef.current?.isShow()) {
      setTimeout(() => {
        setShowGuide(true);
      }, 100);
    }
  }, [noGuide, isImageMode, userData, secretKeyPopupRef.current?.isShow()]);

  const navigate = useNavigate();
  const [isRowMode, setIsRowMode] = useIsRowMode();

  const [isZenMode, setIsZenMode] = useZenMode();
  const [showInZen, setShowInZen] = useState(false);
  useEffect(() => {
    if (isZenMode) {
      setShowInZen(false);
    }
  }, [isZenMode]);

  const { addMoreModel, activeModels } = useActiveModels();
  const mobileModelSelectorRef = useRef();
  const webCopilotSettingsRef = useRef();
  const onAddMoreModel = () => {
    if (isMobile) {
      mobileModelSelectorRef.current.open();
    } else {
      addMoreModel();
    }
  };

  return (
    <>
      {showGuide && <Guide />}
      {isMobile && <MobileModelSelector ref={mobileModelSelectorRef} />}
      {isZenMode && (
        <div
          className="h-3 hover:bg-primary hover:bg-opacity-10 transition-colors"
          onMouseOver={() => setShowInZen(true)}
        ></div>
      )}

      <div
        onMouseLeave={() => setShowInZen(false)}
        className={
          'h-12 w-full filter backdrop-blur text-xl flex items-center px-4 ' +
          (isZenMode
            ? 'fixed top-0 left-0 right-0 z-50 transform transition-visible duration-300 delay-150 ' +
              (showInZen
                ? 'translate-y-0 opacity-100'
                : '-translate-y-full opacity-0')
            : ' ')
        }
      >
        <div className="w-6 mr-auto cursor-pointer"></div>

        <div id={GUIDE_STEP.HEADER_MORE_FUNCTION} className="flex items-center">
          {!isImageMode && (
            <Tooltip placement="bottom" content={t('header.add_model')}>
              <i
                className="block i-ri-apps-2-add-line cursor-pointer mr-4"
                onClick={onAddMoreModel}
              ></i>
            </Tooltip>
          )}


          <i
            className={
              (isDark ? 'i-ri-sun-line' : 'i-ri-moon-line') +
              ' cursor-pointer mr-4'
            }
            onClick={() => setDarkMode(!isDark)}
          ></i>

          <Dropdown
            maxColumnWidth="160"
            direction="left"
            trigger="click"
            options={[
              {
                icon: isRowMode
                  ? 'i-mingcute-columns-3-fill'
                  : 'i-mingcute-rows-3-fill',
                onClick: () => setIsRowMode(!isRowMode),
                hidden: isMobile || isImageMode,
                disabled: activeModels.length <= 1,
                title: t(
                  isRowMode
                    ? 'header.multi_column_mode'
                    : 'header.dual_line_mode'
                ),
              },
              {
                icon: 'iconify mingcute--radiobox-line',
                onClick: () => setIsZenMode(!isZenMode),
                hidden: isMobile,
                title: t(
                  isZenMode ? 'header.exit_zen_mode' : 'header.zen_mode'
                ),
              }
            ]
              .filter(item => !item.hidden)
              .map(item => ({
                prefixIcon: <i className={item.icon + ' mr-0'} />,
                content: item.title,
                onClick: item.onClick,
                disabled: item.disabled,
                value: item.title,
                children: item.children,
              }))}
          >
            <i className={'i-ri-more-fill cursor-pointer'}></i>
          </Dropdown>
        </div>
      </div>
      <CustomModelDrawer ref={customModelRef} />
      <SecretKeyPopup
        ref={secretKeyPopupRef}
        onImport={openConfigModal}
        checkKeyValid={getUserData}
      />
      <ConfigImportModal ref={configModalRef} />
      <WebCopilotSettingsModal ref={webCopilotSettingsRef} />
    </>
  );
}
