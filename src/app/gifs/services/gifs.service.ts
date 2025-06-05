import { HttpClient } from '@angular/common/http';
import { computed, effect, inject, Injectable, signal } from '@angular/core';
import { environment } from '@environments/environment';
import type { GiphyResponse } from '../interfaces/giphy.interfaces';
import { Gif } from '../interfaces/gif.interface';
import { GifMapper } from '../mapper/gif.mapper';
import { map, tap } from 'rxjs';

const loadFromLocalStorage = () =>{
  const gifsFromLocalStorage = localStorage.getItem('gifs') ?? '{}';
  const gifs = JSON.parse(gifsFromLocalStorage);
  return gifs

};

@Injectable({providedIn: 'root'})

export class GifService {


  private http = inject(HttpClient)

  trendingGifs = signal<Gif[]>([]);
  trendingGifsLoading = signal(false);
  
  private trendingPage = signal(0);

  trendingGifGroup = computed(()=> {
    const groups = [];

    for (let i = 0; i < this.trendingGifs().length; i+=3) {
      groups.push(this.trendingGifs().slice(i, i + 3))
    }

    return groups;
  })

  searchHistory = signal<Record<string, Gif[]>>(loadFromLocalStorage())
  searchHistoryKeys = computed(() => Object.keys(this.searchHistory()));

  saveGifsToLocateStorege = effect(()=>{
    const historyString =  JSON.stringify(this.searchHistory());
    localStorage.setItem('gifs', historyString);
  })

  constructor () {
    this.loadTrendingGifs();
  }
   
  loadTrendingGifs(){

    if (this.trendingGifsLoading()) return;

    this.trendingGifsLoading.set(true);

    this.http.get<GiphyResponse>(`${ environment.giphyUrl}/gifs/trending`,{
      params: {
        api_key: environment.giphyApiKey,
        limit: 20,
        offset: this.trendingPage() * 20,
      }
    }).subscribe( (resp) => {
      const gifs =  GifMapper.mapGiphyItemsToGifArray(resp.data);
      this.trendingGifs.update( currentGifs => [
        ...currentGifs,
        ...gifs
      ]);
      this.trendingPage.update( (page) => page + 1);
      this.trendingGifsLoading.set(false);
    })
  }

  SearchGifs(query:string){
    return this.http.get<GiphyResponse>(`${ environment.giphyUrl}/gifs/search`,{
      params:{
        api_key: environment.giphyApiKey,
        q: query,
        limit: 20,
      } // Transformamos
    }).pipe(
      map(({ data }) => data ),
      map(( items ) => GifMapper.mapGiphyItemsToGifArray(items)),

      // Ejecutamos un efecto
      tap(items => {
        this.searchHistory.update( history =>({
          ...history, 
          [query.toLowerCase()]: items,
        }))
      })
    );

  }

  getHistoryGifs(query: string): Gif[] {
    return this.searchHistory()[query] ?? [];
  }
 
  
}