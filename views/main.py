import requests
import pandas as pd

# Faça a solicitação Ajax para obter os dados
url = 'http://localhost:3131/admin/orders'  # Substitua pelo URL correto
response = requests.get(url)

# Verifique se a solicitação foi bem-sucedida
if response.status_code == 200:
    data = response.json()

    # Lista para armazenar os dados
    extracted_data = []

    # Extrair dados
    for order in data['orders']:
        for compra in order['compras']:
            pedido = order['_id']
            cliente = order['user']['nome']
            produto = compra['product']['name']
            total = compra['product']['price']
            endereco_parts = [
                str(compra['endereco']['cidade']),
                str(compra['endereco']['rua']),
                str(compra['endereco']['bairro']),
                str(compra['endereco']['numero']),
                str(compra['endereco']['cep']),
                str(compra['endereco']['complemento'])
            ]
            
            endereco = ' '.join(endereco_parts)

            endereco = ' '.join(endereco_parts)
            qtde = compra['quantity']

            # Adicionar dados à lista
            extracted_data.append({'Pedido': pedido, 'Cliente': cliente, 'Produto': produto, 'Total': total, 'Endereço': endereco, 'Quantidade': qtde})

    # Criar um DataFrame do Pandas
    df = pd.DataFrame(extracted_data)

    # Salvar em CSV
    df.to_csv('dados.csv', index=False, encoding='utf-8-sig')

    # Salvar em XLSX (Excel)
    df.to_excel('dados.xlsx', index=False)

    # Salvar em JSON
    df.to_json('dados.json', orient='records', lines=True, force_ascii=False)

    print('Dados salvos com sucesso!')
else:
    print(f'Falha na solicitação: {response.status_code}')
