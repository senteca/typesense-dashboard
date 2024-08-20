import axios, { AxiosInstance } from 'axios';
import * as Typesense from 'typesense';
import { CollectionAliasSchema } from 'typesense/lib/Typesense/Aliases';
import { CollectionCreateSchema } from 'typesense/lib/Typesense/Collections';
import { CollectionUpdateSchema } from 'typesense/lib/Typesense/Collection';
import { NodeConfiguration } from 'typesense/lib/Typesense/Configuration';
import { SearchParams } from 'typesense/lib/Typesense/Documents';
import { KeyCreateSchema } from 'typesense/lib/Typesense/Key';
import { OverrideSchema } from 'typesense/lib/Typesense/Override';
import { SynonymSchema } from 'typesense/lib/Typesense/Synonym';
import { PresetCreateSchema } from 'typesense/lib/Typesense/Presets';
import AnalyticsRule, { AnalyticsRuleCreateSchema } from 'typesense/lib/Typesense/AnalyticsRule';
import AnalyticsRules from 'typesense/lib/Typesense/AnalyticsRules';
import { StopwordCreateSchema } from 'typesense/lib/Typesense/Stopwords';

export class Api {
  public axiosClient?: AxiosInstance;
  private typesenseClient?: Typesense.Client;


  public init({node, apiKey}: {node:NodeConfiguration, apiKey:string}):void {
    this.axiosClient = axios.create({
      baseURL: `${node.protocol}://${node.host}:${node.port}${node.path || ''}`,
      headers: {
        'x-typesense-api-key': apiKey,
        'X-Senteca-Authorization': `Bearer ${process.env.VUE_APP_SENTECA_KEY}`
      }
    });
    this.typesenseClient = new Typesense.Client({
      nodes: [{
        ...node
      }],
      additionalHeaders: {
        'X-Senteca-Authorization': `Bearer ${process.env.VUE_APP_SENTECA_KEY}`
      },
      apiKey,
      //connection_timeout_seconds: 3600,
    });
  }

  public getDebug() {
    return this.typesenseClient?.debug.retrieve();
  }

  public getCollections(){
    return this.typesenseClient?.collections().retrieve();
  }

  public createCollection(schema: CollectionCreateSchema) {
    return this.typesenseClient?.collections().create(schema);
  }

  public getCollection(collectionName:string){
    return this.typesenseClient?.collections(collectionName).retrieve();
  }

  public dropCollection(collectionName:string){
    return this.typesenseClient?.collections(collectionName).delete();
  }

  public updateCollection(collectionName:string, schema: CollectionUpdateSchema ) {
    return this.typesenseClient?.collections(collectionName).update(schema)
  }

  public getAliases() {
    return this.typesenseClient?.aliases().retrieve();
  }

  public upsertAlias(alias: CollectionAliasSchema) {
    return this.typesenseClient?.aliases().upsert(alias.name, { collection_name: alias.collection_name });
  }

  public deleteAlias(name: string) {
    return this.typesenseClient?.aliases(name).delete();
  }

  public getApiKeys() {
    return this.typesenseClient?.keys().retrieve();
  }

  public createApiKey(apiKey: KeyCreateSchema){
    return this.typesenseClient?.keys().create(apiKey);
  }

  public async deleteApiKey(id: string){
    if(this.typesenseClient) {
      await this.typesenseClient.keys(parseInt(id, 10)).delete();
    }
  }

  public getAnalyticsRules() {
    return this.typesenseClient?.analytics.rules().retrieve();
  }

  public upsertAnalyticsRule(name: string, rule: AnalyticsRuleCreateSchema) {
    return (this.typesenseClient?.analytics.rules() as AnalyticsRules).upsert(name, rule);
  }

  public deleteAnalyticsRule(name: string) {
    return (this.typesenseClient?.analytics.rules(name) as AnalyticsRule).delete();
  }

  public getSearchPresets() {
    return this.typesenseClient?.presets().retrieve();
  }

  public upsertSearchPreset(name: string, preset: PresetCreateSchema) {
    return this.typesenseClient?.presets().upsert(name, preset);
  }

  public deleteSearchPreset(name: string) {
    return this.typesenseClient?.presets(name).delete();
  }

  public getStopwords() {
    return this.typesenseClient?.stopwords().retrieve();
  }

  public upsertStopwords(id: string, stopwordsSet: StopwordCreateSchema) {
    return this.typesenseClient?.stopwords().upsert(id, stopwordsSet);
  }

  public deleteStopwords(id: string) {
    return this.typesenseClient?.stopwords(id).delete();
  }

  public getSynonyms(collectionName: string) {
    return this.typesenseClient?.collections(collectionName)
    .synonyms()
    .retrieve();
  }

  public upsertSynonym(collectionName: string, id:string, synonym:SynonymSchema){
    return this.typesenseClient?.collections(collectionName).synonyms().upsert(id, synonym);
  }

  public deleteSynonym(collectionName: string, id: string) {
    return this.typesenseClient?.collections(collectionName).synonyms(id).delete();
  }

  public getOverrides(collectionName:string){
    return this.typesenseClient?.collections(collectionName).overrides()
    .retrieve();
  }

  public upsertOverride(collectionName: string, id:string, override: OverrideSchema){
    return this.typesenseClient?.collections(collectionName).overrides().upsert(id, override);
  }

  public deleteOverride(collectionName: string, id: string) {
    return this.typesenseClient?.collections(collectionName).overrides(id).delete();
  }

  public deleteDocumentById(collectionName: string, id: string) {
    return this.typesenseClient?.collections(collectionName).documents(id).delete();
  }

  public importDocuments(collectionName: string, documents: unknown[]|string, action:string){
    if (!this.typesenseClient) return;
    //eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return (this.typesenseClient.collections(collectionName)?.documents() as any).import(documents,  { action }).catch((error: any) => {
      //eslint-disable-next-line
      return error.importResults;
    });
  }

  public exportDocuments(collectionName: string){
    return this.typesenseClient?.collections(collectionName)
    .documents()
    .export()
  }

  public search(collectionName: string, searchParameters: SearchParams) {
    return this.typesenseClient?.collections(collectionName).documents().search(searchParameters);
  }


  //eslint-disable-next-line @typescript-eslint/no-explicit-any
  public get(url:string):Promise<any>|void {
    return this.axiosClient?.get(url).then(r => {
      return {data: r.data};
      }).catch(err => {
      throw Error(err.response?.data?.message || err.message)
    });
  }

  //eslint-disable-next-line @typescript-eslint/no-explicit-any
  public post(url:string, body?:any):Promise<any>|void {
    return this.axiosClient?.post(url, body).then(r => {
      return {data: r.data};
      }).catch(err => {
      throw Error(err.response?.data?.message || err.message)
    });
  }

}
