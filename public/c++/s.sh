i=1
g++ get_data.cpp
while [[ -s graph5_static_${i} ]]
do
    echo ${i}
    ./a.out < graph5_static_${i} >graph5_static_$((i+1))
    i=$((i+1))
done

# max_tests=65
# j=1
# while [ $j -le $max_tests ]
# do
#     echo ${j}
#     g++ get_json.cpp
#     ./a.out < graph5_oscilator_${j} >graph5_oscilator_$((j)).json
#     j=$((j+1))
# done