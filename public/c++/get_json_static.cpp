#include <bits/stdc++.h>
using namespace std;
const int maxn = 33554499;
vector<int> graph[maxn];
vector<int> depth(maxn),disc(maxn),low(maxn);
vector<bool> bridge(maxn),vis(maxn),vis2(maxn);
#define __ ios_base::sync_with_stdio(false),cin.tie(NULL);
#define endl '\n'
int idx = 0;
int tamanio = 0;
bool flag = false;
void dfs(int u,int p = -1){
    vis[u] = true;
    tamanio++;
    disc[u] = idx++;
    low[u] = disc[u]; 
    for(auto v:graph[u]){
        if(v == u)flag = true;
        if(v == p)continue;
        if(!vis[v]){
            dfs(v,u);
            if(low[v]>disc[u])bridge[v]= true;
        }
        low[u] = min(low[u],low[v]);
    }
}
vector<int> nextt(maxn,-1);
vector<int> next2(maxn,-1);
void dfs2(int u,int p = -1){
    next2[u] = nextt[u];
    vis2[u] = true;
    for(auto v:graph[u]){
        if(v == p)continue;
        if(!vis2[v])
            dfs2(v,u);
    }
}
int main(){__
    int n,u,v;
    cin>>n;
    // cout<<n<<endl;
    vector<bool> is_in_data(maxn);
    for(int i = 0;i<n;i++){
        cin>>u>>v;
        // cout<<i<<endl;
        graph[u].push_back(v);
        graph[v].push_back(u);
        nextt[u] = v;
        is_in_data[u] = true;
        is_in_data[v] = true;
    }
    for(int i = 0;i<maxn;i++){
        if(!vis[i]&& is_in_data[i]){
            flag = false;
            // cout<<i<<endl;
            dfs(i);
            if(flag)
                dfs2(i);
        }
    }
    int sz = 0;
    for(int i = 0;i<maxn;i++){
        if(next2[i]!= -1){
            sz++;
        }
    }
    cout<<sz<<endl;
    for(int i = 0;i<maxn;i++){
        if(next2[i]!= -1)
            cout<<i<<" "<<next2[i]<<endl;
    }
    return 0;
}