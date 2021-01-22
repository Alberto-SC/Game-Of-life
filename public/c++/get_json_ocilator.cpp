#include <bits/stdc++.h>
using namespace std;
const int maxn = 33554499;
vector<int> graph[maxn];
vector<int> depth(maxn),disc(maxn),low(maxn);
vector<bool> bridge(maxn),vis(maxn),cycle(maxn);
#define __ ios_base::sync_with_stdio(false),cin.tie(NULL);
#define endl '\n'
int idx = 0;
bool flag = false;
vector<bool> vis2(maxn);
void dfs(int u,int p = -1){
    vis[u] = true;
    disc[u] = idx++;
    low[u] = disc[u]; 
    int parent = 0;
    for(auto v:graph[u]){
        if(v == p){parent++;continue;}
        if(!vis[v]){
            dfs(v,u);
            if(low[v]>disc[u])bridge[v]= true;
            else flag = true;
        }
        low[u] = min(low[u],low[v]);
    }
    if(parent ==2)flag = true;
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
    vector<int> next(maxn,-1);
    for(int i = 0;i<n;i++){
        cin>>u>>v;
        // cout<<i<<endl;
        graph[u].push_back(v);
        graph[v].push_back(u);
        nextt[u] = v;
        is_in_data[u] = true;
        is_in_data[v] = true;
    }
    int cont = 0;
    // cout<<"HI"<<endl;
    for(int i = 0;i<maxn;i++){
        if(!vis[i]&& is_in_data[i]){
            // cout<<i<<endl;
            flag =false;
            
            dfs(i);
            if(flag){
                dfs2(i);
            }
            cont++;
        }
    }
    int sz =0;
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
    // cout<<json<<endl;
    return 0;
}