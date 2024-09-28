import {
  useActiveSystemPromptId,
  useLocalStorageJSONAtom,
} from '@src/store/storage'
import { useMemo } from 'react';

import ImgNon from "@src/assets/img/non.svg";
import { LOCAL_STORAGE_KEY } from './types';

const presetOf = (
  name,
  icon,
  desc,
  prompt,
) => ({ name, icon, desc, content: prompt, id: `preset-${name}`, isPreset: true });

const systemPromptPresets = [
  presetOf(
    'None',
    ImgNon,
    'Nothing. Go ahead and have fun',
    ''
  ),
  presetOf('English Translator', 'https://sf-maas-uat-prod.oss-cn-shanghai.aliyuncs.com/outputs/8a95ce92-bbd5-4b51-998b-0da2ebd0f7dc_0.png', '', 'You are a highly skilled translation engine with expertise in the technology sector. Your function is to translate texts accurately into English, maintaining the original format, technical terms, and abbreviations. Do not add any explanations or annotations to the translated text.Translate the following source text to English, Output translation directly without any additional text.Source Text: '),
  presetOf('费曼老师', 'https://sf-maas-uat-prod.oss-cn-shanghai.aliyuncs.com/outputs/deeab01e-60eb-4e90-b421-e9937876c0d2_00001_.png', '', `请用简单易懂的语言解释一个概念，比如可以包含如下几个方面：
    定义：这个概念是什么？
    背景和发展历史：这个概念是如何产生的？它的发展历程是怎样的？
    局限性：这个概念有哪些不足或限制？
    重要性：为什么这个概念很重要？它有哪些实际应用？
    相关概念：这个概念与哪些其他概念有关联？
    实例例子：请提供一些具体的例子来帮助理解这个概念。
    
    请注意：**请适当使用markdown等以提供更好的阅读体验。**
    
    我想要了解的概念是：`)
];

export const SYSTEM_PROMPT_PRESETS = systemPromptPresets;

export function useSystemPrompts () {
  const [activeId, setActiveId] = useActiveSystemPromptId();
  const [customPrompts, setCustomPrompts] = useLocalStorageJSONAtom(LOCAL_STORAGE_KEY.SYSTEM_PROMPTS);
  const all = useMemo(() => [...systemPromptPresets, ...customPrompts], [customPrompts])
  const active = all.find(p => p.id === activeId) || all[0];
  const save = (prompt) => {
    const newPrompts = [...customPrompts];
    const index = newPrompts.findIndex(p => p.id === prompt.id);
    if (index === -1) {
      prompt.id = `custom-${Date.now()}`;
      newPrompts.push(prompt);
    } else {
      newPrompts[index] = prompt;
    }
    setCustomPrompts(newPrompts);
  };
  const remove = (prompt) => {
    const newPrompts = customPrompts.filter(p => p.id !== prompt.id);
    console.log(newPrompts);
    setCustomPrompts(newPrompts);
  };
  const setActive = (prompt) => {
    setActiveId(prompt.id);
  }
  return { active, setActive, all, save, remove }
}