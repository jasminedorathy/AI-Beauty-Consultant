import codecs

file_path = r"d:\Caldim_Projects\AI_Beauty_Consultant-main\AI_Beauty_Consultant-main\backend\app\api\inventory_routes.py"
try:
    content = codecs.open(file_path, encoding='utf-16').read()
    with codecs.open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)
    print("Successfully converted inventory_routes.py to UTF-8.")
except Exception as e:
    print(f"Error: {e}")
