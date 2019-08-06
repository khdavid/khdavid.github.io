import matplotlib.pyplot as plt
import numpy as np
import os.path

# Считывание данных о давлении 
def load_array(way, name):
    os.chdir(way)
    with open(name, 'r') as f:
        data = f.readlines()
    f.close();
    
    day = []
    N = []
    i = 0
    while i <= len(data) - 1:
        line = data[i].split()
        day.append(float(line[0]))
        N.append(float(line[1]))
        i += 1
    return day, N
    
Days1, N1 = load_array('D:/Plots/', 'ND 0 CASLEO HOUR WAVE.txt')

N = np.mean(N1)
dt = Days1[1] - Days1[0]
F = []

i = 1
while i <= len(N1):
    F.append(1/(i*dt))
    i += 1
    
y_fft = np.fft.fft(N1)

print y_fft


plt.plot(F, np.abs(y_fft))

plt.show()

