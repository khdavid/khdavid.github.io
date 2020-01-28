#include <cstdlib>

struct vec2
{
  float x;
  float y;
  vec2 operator-()
  {
    return { -x, -y };
  }
};

struct vec4
{
  float x;
  float y;
  float z;
  float w;
  vec4 operator-() const
  {
    return { -x, -y };
  }
  vec4 operator-(const vec4& right)
  {
    return { x - right.x, y - right.y, z - right.z, w - right.z };
  }
};

template<class T>
vec4 operator*(const vec4 &first, T factor)
{
  return { first.x * factor , first.y * factor, first.z * factor, first.w * factor };
}

template<class T>
vec4 operator*(T factor, const vec4 &second)
{
  return second * factor;
}

template<class T>
vec4 operator/(const vec4 &first, T divisor)
{
  return { first.x / divisor , first.y / divisor, first.z / divisor, first.w / divisor };
}

vec4 operator+(const vec4 &first, const vec4 &second)
{
  return { 
    first.x + second.x,
    first.y + second.y,
    first.z + second.z,
    first.w + second.w,
  };
}




vec2 sumStrict(float a, float b)
{
  //|a| > |b|
  vec2 result;
  result.x = a + b;
  result.y = b - (result.x - a);
  return result;
}

vec2 sum(float a, float b)
{
  return (abs(a) > abs(b)) ? sumStrict(a, b) : sumStrict(b, a);
}

vec2 minus(float a, float b)
{
  return sum(a, -b);
}

vec2 sum(vec2 a, vec2 b)
{
  vec2 highSum = sum(a.x, b.x);
  vec2 lowSum = sum(a.y, b.y);
  return highSum;
  highSum.y += lowSum.x;
  highSum = sum(highSum.x, highSum.y);

  highSum.y += lowSum.y;
  highSum = sum(highSum.x, highSum.y);

  return highSum;
}

vec2 minus(vec2 a, vec2 b)
{
  return sum(a, -b);
}

vec2 split(float a)
{
  float split = 4097.0; // 2^12 + 1
  vec2 result;
  float t = a * split;
  result.x = t - (t - a);
  result.y = a - result.x;
  return result;
}

vec2 product(float a, float b)
{
  vec2 result;
  result.x = a * b;
  vec2 splA = split(a);
  vec2 splB = split(b);
  float error = result.x - splA.x * splB.x -
    splA.x * splB.y - splA.y * splB.x;
  result.y = splA.y * splB.y - error;
  return result;
}

vec2 product(vec2 a, vec2 b)
{
  vec2 result;
  result = product(a.x, b.x);
  result.y += a.x * b.y;
  result.y += a.y * b.x;
  result = sum(result.x, result.y);
  return result;
}


struct ComplexNumber
{
  float Real;
  float Imagine;
};

struct ComplexNumber64
{
  vec2 Real;
  vec2 Imagine;
};


ComplexNumber Product(ComplexNumber first, ComplexNumber second)
{
  ComplexNumber result;
  result.Real = first.Real * second.Real - first.Imagine * second.Imagine;
  result.Imagine = first.Real * second.Imagine + first.Imagine * second.Real;
  return result;
}

ComplexNumber64 Product(ComplexNumber64 first, ComplexNumber64 second)
{
  ComplexNumber64 result;
  result.Real = minus(product(first.Real, second.Real), product(first.Imagine, second.Imagine));
  result.Imagine = sum(product(first.Real, second.Imagine), product(first.Imagine, second.Real));
  return result;
}


ComplexNumber Add(ComplexNumber first, ComplexNumber second)
{
  ComplexNumber result;
  result.Real = first.Real + second.Real;
  result.Imagine = first.Imagine + second.Imagine;
  return result;
}

ComplexNumber64 Add(ComplexNumber64 first, ComplexNumber64 second)
{
  ComplexNumber64 result;
  result.Real = sum(first.Real, second.Real);
  result.Imagine = sum(first.Imagine, second.Imagine);
  return result;
}


float length2(ComplexNumber number)
{
  return number.Real * number.Real + number.Imagine * number.Imagine;
}

vec2 length2(ComplexNumber64 number)
{
  return sum(product(number.Real, number.Real), product(number.Imagine, number.Imagine));
}

vec4 linearExtrapolation(vec4 first, vec4 last, int min, int max, int x)
{
  float xDiff = float(max - min);
  return first + float(x - min) * (last - first) / xDiff;
}

int getOutOfBoundsIdx()
{
  const int nMax = 400;

  ComplexNumber64 z;
  z.Real = {0.,0.};
  z.Imagine = {0., 0.};

  ComplexNumber64 c;

  const vec2 gl_FragCoord = { 0.000001, 0.00002};
  const float xShift = 0;
  const float yShift = 0;
  const float fade = 100;

  c.Real = product(minus(float(gl_FragCoord.x), xShift), vec2{ fade, 0 });
  c.Imagine = product(minus(float(gl_FragCoord.y), yShift), vec2{ fade, 0 });

  for (int i = 0; i < nMax; i++)
  {
    z = Add(Product(z, z), c);
    if (length2(z).x > 4.)
    {
      return i;
    }
  }

  return nMax;
}


int main()
{

  const vec4 blue = vec4{ 166., 202., 240., 255. } / 255.f;
  const vec4 biruz = vec4{ 123, 228, 209, 255 } / 255.f;
  const vec4 red = vec4{ 255, 0, 0, 255 } / 255.f;
  const vec4 green = vec4{ 0, 255, 0, 255 } / 255.f;
  const vec4 black = vec4{ 0, 0, 0, 255 } / 255.f;



  const int kThreshold0 = 0;
  const int kThreshold1 = 100;
  const int kThreshold2 = 150;
  const int kThreshold3 = 250;
  const int kThreshold4 = 390;


  int k = getOutOfBoundsIdx();

  vec4 color;
  if (k < kThreshold1)
  {
    color = linearExtrapolation(biruz, blue, kThreshold0, kThreshold1, k);
  }
  else if (k < kThreshold2)
  {
    color = linearExtrapolation(red, green, kThreshold1, kThreshold2, k);
  }
  else if (k < kThreshold3)
  {
    color = linearExtrapolation(biruz, blue, kThreshold2, kThreshold3, k);
  }
  else if (k < kThreshold4)
  {
    color = linearExtrapolation(biruz, green, kThreshold3, kThreshold4, k);
  }

  else
  {
    color = black;
  }

  vec4 gl_FragColor;
  gl_FragColor = color;

}


