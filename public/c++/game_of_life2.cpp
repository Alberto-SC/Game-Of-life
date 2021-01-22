#include <bits/stdc++.h>
using namespace std;
set<int> graph[100000];
map<int,bool> vis;
vector<int> depth,disc,low;
vector<bool> bridge;
int idx = 0;
void dfs(int u,int p = -1){
    // cout<<u<<" "<<p<<endl;
    vis[u] = true;
    disc[u] = idx++;
    low[u] = disc[u]; 
    // cout<<"CHILDS "<<endl;
    // for(auto v:graph[u])
        // cout<<v<<" ";
    // cout<<endl;
    for(auto v:graph[u]){
        if(v == p)continue;
        if(!vis.count(v)){
            dfs(v,u);
            if(low[v]>disc[u])bridge[v]= true;
        }
        low[u] = min(low[u],low[v]);
    }
}
int main(){
    int n,u,v;
    cin>>n;
    depth.resize(n);
    low.resize(n);
    disc.resize(n);
    bridge.resize(n);
    map<int,int> rgraph;
    vector<int> nodes;
    for(int i = 0;i<n;i++){
        cin>>u>>v;
        // cout<<u<<" "<<v<<endl;
        rgraph[u] =v;
        nodes.push_back(u);
        graph[u].insert(v);
        graph[v].insert(u);        
    }
    // cout<<"GRAPH"<<endl;
    // for(auto c:graph){
    //     cout<<c.first<<" ->";
    //     for(auto v:c.second)cout<<v<<" ";
    //     cout<<endl;
    // }
    int cont = 0;
    // cout<<"HI"<<endl;
    for(auto c:nodes){
        if(cont >=1)break;
        // cout<<"R-> "<<c<<" "<<endl;
        if(vis.count(c)){
            // cout<<"NOU"<<endl;
        }
        else{
            // cout<<"Componente "<<c<<endl;
            int s = c;
            dfs(s);
            // cout<<endl<<endl;
            cont++;
        }
    }
    // cout<<"HI"<<endl;
    string json = "{\n \"nodes\":[\n";
    cout<<endl;
    // cout<<vis.size()<<endl;
    int id = 0;
    map<int,int> remap;
    for(auto c:vis){
        // cout<<c.first<<" "<<c.second<<endl;
        int tipo = 1;
        int radius = 2;
        if(c.first == rgraph[c.first])tipo = 2,radius = 3;
        else if(!bridge[c.first])tipo = 3,radius = 5;
        json+= "\t{\"id\": \""+to_string(id)+"\", \"group\":\""+
        to_string(tipo)+"\",\"radius\": "+to_string(radius)+", \"name\": \""+to_string(c.first)+"\"}";
        remap[c.first] = id;
        if(id+1!=vis.size())
            json+=",\n";
        else   
            json+="\n";
        id++;
    }
    json+="\t],\n";
    json+="\"links\":[\n";
    int sz = 0;
    for(auto c:vis){
        sz++;
        // cout<<c.first<<" "<<c.second<<endl;
        json+= "\t{\"source\": \""+to_string(remap[c.first])+"\", \"target\": \""+to_string(remap[rgraph[c.first]])+"\"}";
        if(sz!= vis.size())
            json+=",\n";
        else   
            json+="\n";
        rgraph.erase(c.first);
    }
    json+="\n]\n}";
    // cout<<json<<endl;
    // cout<<endl;
    // cout<<"HI"<<endl;
    cout<<rgraph.size()<<endl;
    for(auto c:rgraph)
        cout<<c.first<<" "<<c.second<<endl;
    return 0;
}