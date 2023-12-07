import requests
import pandas as pd

url = 'http://localhost:3131/admin/orders' 
response = requests.get(url)

#verifica se deu certo
if response.status_code == 200:
    data = response.json()

    #lista para armazenar os dados
    extracted_data = []

    #for para extrair os dados
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

            #adiciona a lista
            extracted_data.append({'Pedido': pedido, 'Cliente': cliente, 'Produto': produto, 'Total': total, 'Endereço': endereco, 'Quantidade': qtde})

    df = pd.DataFrame(extracted_data)

    #extrai para csv
    df.to_csv('dados.csv', index=False, encoding='utf-8-sig')

    #extrai para xlsx
    df.to_excel('dados.xlsx', index=False)

    #extrai para json
    df.to_json('dados.json', orient='records', lines=True, force_ascii=False)

    #informa se deu certo
    print('Dados salvos com sucesso!')
else:
    #informa se deu algo errado
    print(f'Falha na solicitação: {response.status_code}')
