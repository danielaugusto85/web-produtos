import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

//Criando uma estrutura de dados para representar um produto
interface Produto { //Modelo de dados
  id: number; //Atributo 'id'
  nome: string; //Atributo 'nome'
  descricao: string; //Atributo 'descricao'
  preco: number; //Atributo 'preco'
  quantidade: number; //Atributo 'quantidade'
  total: number  //Atributo 'total'
}

@Component({
  selector: 'app-root',
  imports: [
    FormsModule,
    CommonModule
  ],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {

    //Endereço da API
    apiUrl: string = 'http://localhost:8081/api/v1/produtos';

    //Criando um objeto da biblioteca HttpClient
    httpClient = inject(HttpClient);
    
    //Variável signal para armazenar a lista de produtos obtida da API
    produtos = signal<any[]>([]);

    //Variável signal para exibir mensagens e notificações na página
    mensagem = signal<string>('');
    
    //Atributo para capturar o nome do produto
    nomeProduto: string = '';

    //Atributo para guardar os dados de um produto
    produtoSelecionado = signal<Produto>({
      id : 0, //valor padrão
      nome : '', //valor padrão
      descricao: '', //valor padrão
      preco : 0, //valor padrão
      quantidade : 0, //valor padrão
      total : 0 //valor padrão
    });

    //Atributo para guardar uma flag que indique quando o formulário 
    //de cadastro ou edição do produto será exibido
    exibirFormulario = signal<boolean>(false);



    //Função para ser executada quando o botão de pesquisa for clicado
    pesquisarProdutos() {

      //Fazendo uma requisição HTTP GET para consultar os produtos na API
      this.httpClient
          .get<any[]>(`${this.apiUrl}/listar?nome=${this.nomeProduto}`)
          .subscribe((data) => { //Capturando a resposta da API
            //console.log(data); //Exibindo a resposta no console do navegador
            //Armazenar os dados obtidos da API no signal
            this.produtos.set(data);
          });
    }

    //Função para ser executada quando clicarmos no botão de exclusão
    excluirProduto(id: number) {
      if(confirm('Deseja realmente excluir o produto selecionado?')) {
          //Fazendo uma requisição HTTP DELETE para excluir um produto na API
      this.httpClient
          .delete(`${this.apiUrl}/excluir/${id}`, { responseType: 'text'})
          .subscribe((response) => { 
            //armazenando a resposta obtida da API
            this.mensagem.set(response);
            //Fazendo uma nova consulta dos produtos
            this.pesquisarProdutos();
          })
      }
    } 

    //Função para exibir o formulário de cadastro dse produto
    novoProduto() {
      this.exibirFormulario.set(true);
      this.mensagem.set('');
    }

    //Função para ocultar o formulário e limpar os valores dos campos
    cancelarEdicao() {
      this.exibirFormulario.set(false);
      this.produtoSelecionado.set({
        id : 0, //valor padrão
      nome : '', //valor padrão
      descricao: '', //valor padrão
      preco : 0, //valor padrão
      quantidade : 0, //valor padrão
      total : 0 //valor padrão
      });
    }

    //Função para realizar o cadastro do produto na API
    cadastrarProduto() {
      //Enviando uma requisição POST para a API
      this.httpClient.post(`${this.apiUrl}/criar`, this.produtoSelecionado(), { responseType : 'text' })
        .subscribe((response) => {
          this.mensagem.set(response);
          this.cancelarEdicao();

          //Verificar se há uma consulta de produtos na tela
          if(this.produtos().length > 0) {
            this.pesquisarProdutos(); //executando a consulta
          }
        });
    }
}
