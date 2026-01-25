import json
import os
import time
from deep_translator import GoogleTranslator

# Configurações de caminhos
BASE_PATH = "public/locales"
SOURCE_LANG = "en"
TARGET_LANGS = ["zh-CN", "ko", "pt", "fr", "de", "es"] # Chinês, Coreano, Português, Francês, Alemão, Espanhol
FILENAME = "common.json"

def translate_content(data, target_lang):
    """Navega pelo JSON e traduz apenas os valores."""
    translator = GoogleTranslator(source='en', target=target_lang)
    translated_data = {}

    for key, value in data.items():
        if isinstance(value, dict):
            # Se for um objeto aninhado, chama a função recursivamente
            translated_data[key] = translate_content(value, target_lang)
        else:
            try:
                print(f"  [{target_lang}] Traduzindo: {key}")
                translated_data[key] = translator.translate(value)
                # Pequena pausa para evitar bloqueio de IP
                time.sleep(0.2) 
            except Exception as e:
                print(f"  Erro ao traduzir {key}: {e}")
                translated_data[key] = value # Mantém o original em caso de erro
                
    return translated_data

def main():
    source_file = os.path.join(BASE_PATH, SOURCE_LANG, FILENAME)
    
    if not os.path.exists(source_file):
        print(f"Erro: Arquivo base não encontrado em {source_file}")
        return

    with open(source_file, 'r', encoding='utf-8') as f:
        original_json = json.load(f)

    for lang in TARGET_LANGS:
        print(f"\nIniciando idioma: {lang}")
        
        # Cria a pasta do idioma se não existir (ex: public/locales/pt/)
        lang_dir = os.path.join(BASE_PATH, lang)
        if not os.path.exists(lang_dir):
            os.makedirs(lang_dir)

        # Traduz o conteúdo
        result = translate_content(original_json, lang)

        # Salva o arquivo traduzido
        output_path = os.path.join(lang_dir, FILENAME)
        with open(output_path, 'w', encoding='utf-8') as f:
            json.dump(result, f, ensure_ascii=False, indent=4)
            
        print(f"Finalizado: {output_path}")

if __name__ == "__main__":
    main()