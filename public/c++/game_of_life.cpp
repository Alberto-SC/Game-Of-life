#include <bits/stdc++.h>
using namespace std;
#define print(A) for(auto c:A)cout<<c;
#define printM(A) for(auto c:A){print(c);cout<<endl;}
typedef long long int lli;
#define __ ios_base::sync_with_stdio(false),cin.tie(NULL);
#define MOD(A,n) (((A%n)+n)%n)


int hash_grid(vector<vector<char>> &grid){
    int n = grid.size();
    int cont = 0;
    int hash_g = 0;
    for(int i = 0;i<n;i++){
        for(int j = 0;j<n;j++){
            if(grid[i][j]== '#')
                hash_g|= 1<<cont;
            cont++;
        }
    }
    return hash_g;
}
vector<int> graph(33554499);
vector<bool>vis(33554499);
const int fx[]={+0,+0,+1,-1,-1,+1,-1,+1};   
const int fy[]={-1,+1,+0,+0,+1,+1,-1,-1};  
void game(vector<vector<char>> &grid){
    int n = grid.size();
    // cout<<"GAME "<<endl;
    while(!vis[hash_grid(grid)]){
        vector<vector<char>> nw = grid;
        vis[hash_grid(grid)] = true;
        for(int i = 0;i<n;i++){
            for(int j = 0;j<n;j++){
                int cont = 0;
                for(int k = 0;k<8;k++){
                    int nx = MOD(i+fx[k],n);
                    int ny = MOD(j+fy[k],n);
                    if(grid[nx][ny]== '#')cont++;
                }
                if(grid[i][j]== '#'){
                    if(cont == 3|| cont == 2)nw[i][j] = '#';
                    else nw[i][j] = '.';
                }
                else{
                    if(cont == 3)
                        nw[i][j] = '#';
                    else 
                        nw[i][j] = '.';
                }
            }
        }
        graph[hash_grid(grid)] = hash_grid(nw);
        grid= nw;
    }
}

signed main(){__
    int n;
    cin>>n;
    vector<vector<char>> grid(n,vector<char> (n));
    for(lli i = 0;i<(1<<(n*n));i++){
        lli aux = i;
        for(int j = 0;j<n*n;j++){
            // cout<<j/n<<" "<<j%n<<endl;
            if((aux>>j) &1) grid[j/n][j%n] = '#';
            else grid[j/n][j%n]= '.';
        }
        // printM(grid);
        game(grid);
        // cout<<endl;
    }
    cout<<(1<<(n*n))<<endl;
    for(int i = 0;i<1<<(n*n);i++){ 
        cout<<i<<" "<<graph[i]<<endl;
    }
}