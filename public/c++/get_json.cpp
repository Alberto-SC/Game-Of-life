#include <bits/stdc++.h>
using namespace std;
const int maxn = 33554499;
vector<int> graph[maxn];
vector<int> depth(maxn),disc(maxn),low(maxn);
vector<bool> bridge(maxn),vis(maxn);
#define __ ios_base::sync_with_stdio(false),cin.tie(NULL);
#define endl '\n'
int idx = 0;
int tamanio = 0;
void dfs(int u,int p = -1){
    vis[u] = true;
    tamanio++;
    disc[u] = idx++;
    low[u] = disc[u]; 
    for(auto v:graph[u]){
        if(v == p)continue;
        if(!vis[v]){
            dfs(v,u);
            if(low[v]>disc[u])bridge[v]= true;
        }
        low[u] = min(low[u],low[v]);
    }
}

int main(){__
    int n,u,v;
    cin>>n;
    // cout<<n<<endl;
    vector<bool> is_in_data(maxn);
    vector<int> next(maxn,-1);
    for(int i = 0;i<n;i++){
        cin>>u>>v;
        // cout<<i<<endl;
        graph[u].push_back(v);
        graph[v].push_back(u);
        next[u] = v;
        is_in_data[u] = true;
        is_in_data[v] = true;
    }
    int cont = 0;
    // cout<<"HI"<<endl;
    for(int i = 0;i<maxn;i++){
        // cout<<tamanio<<endl;
        // if(tamanio>=20000)break;
        if(!vis[i]&& is_in_data[i]){
            // cout<<i<<endl;
            dfs(i);
            cont++;
        }
    }
    int sz = 0;
    for(int i = 0;i<maxn;i++)
        if(vis[i])sz++;
    string json = "{\n \"nodes\":[\n";
    vector<int> remap(maxn);
    int id = 0;
    int contComp = 0;
    for(int i = 0;i<maxn;i++){
        if(vis[i]){
            int tipo = 1;
            int radius = 2;
            if(i == next[i])tipo = 2,radius = 3;
            else if(!bridge[i])tipo = 3,radius = 5;
            json+= "\t{\"id\": \""+to_string(id)+"\", \"group\":\""+
            to_string(tipo)+"\",\"radius\": "+to_string(radius)+", \"name\": \""+to_string(i)+"\"}";
            remap[i] = id;
            if(id+1!=sz)
                json+=",\n";
            else   
                json+="\n";
            id++;
        }
    }
    json+="\t],\n";
    json+="\"links\":[\n";
    id = 0;
    for(int i = 0;i<maxn;i++){
        if(vis[i]){
            id++;
            json+= "\t{\"source\": \""+to_string(remap[i])+"\", \"target\": \""+to_string(remap[next[i]])+"\"}";
            if(id!= sz)
                json+=",\n";
            else   
                json+="\n";
            next[i] = -1;
        }
    }
    json+="\n]\n}";
    // vector<pair<int,int>> next2;
    // for(int i = 0;i<maxn;i++){
        // if(next[i]!= -1)
            // next2.push_back({i,next[i]});
    // }
    // if(next2.size()!=0)
    //     cout<<next2.size()<<endl;
    // for(auto c:next2){
    //     cout<<c.first<<" "<<c.second<<endl;
    // }
    cout<<json<<endl;
    return 0;
}