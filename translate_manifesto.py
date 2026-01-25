import json
import os
from translate import Translator

# --- CONFIGURAÇÃO ---
SOURCE_FILE = 'base.json'       # Seu arquivo com o texto em Português
OUTPUT_DIR = 'public/locales'   # Pasta do Next.js
SOURCE_LANG = 'pt'              # Idioma origem

# Lista de idiomas (Códigos ISO 639-1)
TARGET_LANGS = ['en', 'es', 'fr', 'zh', 'ko', 'ja']

# Função para pausar um pouco se precisar (MyMemory às vezes pede)
import time

def translate_recursive(data, dest_lang):
    # Instancia o tradutor para o idioma desejado (usando MyMemory)
    translator = Translator(from_lang=SOURCE_LANG, to_lang=dest_lang, provider='mymemory')

    if isinstance(data, dict):
        return {k: translate_recursive(v, dest_lang) for k, v in data.items()}
    
    elif isinstance(data, list):
        return [translate_recursive(i, dest_lang) for i in data]
    
    elif isinstance(data, str):
        # Pula strings vazias ou códigos
        if not data.strip() or data.startswith('/') or '{' in data:
            return data
        
        try:
            # Traduz
            res = translator.translate(data)
            print(f"   [{dest_lang}] {data[:15]}... -> {res[:15]}...")
            return res
        except Exception as e:
            print(f"   ❌ Erro: {e}")
            return data
    else:
        return data

def main():
    if not os.path.exists(SOURCE_FILE):
        print(f"❌ Crie o arquivo '{SOURCE_FILE}' na raiz primeiro!")
        return

    with open(SOURCE_FILE, 'r', encoding='utf-8') as f:
        source_data = json.load(f)

    if not os.path.exists(OUTPUT_DIR):
        os.makedirs(OUTPUT_DIR)

    print("--- TRADUZINDO VIA MYMEMORY (LIB 'TRANSLATE') ---")

    for lang in TARGET_LANGS:
        print(f"\n🌍 Processando: {lang.upper()}...")
        
        final_data = translate_recursive(source_data, lang)

        # Ajuste para pasta correta (zh vira zh-CN para o Next.js geralmente)
        folder_name = 'zh-CN' if lang == 'zh' else lang
        
        lang_folder = os.path.join(OUTPUT_DIR, folder_name)
        if not os.path.exists(lang_folder):
            os.makedirs(lang_folder)
        
        with open(os.path.join(lang_folder, 'translation.json'), 'w', encoding='utf-8') as f:
            json.dump(final_data, f, indent=2, ensure_ascii=False)
            
        print(f"✅ Salvo em: {lang_folder}/translation.json")

    # Copia o PT
    pt_folder = os.path.join(OUTPUT_DIR, 'pt')
    if not os.path.exists(pt_folder): os.makedirs(pt_folder)
    with open(os.path.join(pt_folder, 'translation.json'), 'w', encoding='utf-8') as f:
        json.dump(source_data, f, indent=2, ensure_ascii=False)

if __name__ == "__main__":
    main()